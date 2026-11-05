import { PricingModel, ProposalType, SeasonalFee } from "@prisma/client";
import { HttpBadRequestError } from "../../../errors/errors-type/htttp-bad-request-error";
import { HttpResourceNotFoundError } from "../../../errors/errors-type/http-resource-not-found-error";
import { calcEventDuration } from "../../../functions/calc-event-duration";
import { calcExtraHourPrice } from "../../../functions/calc-extra-hour-price";
import { calcExtraHoursQty } from "../../../functions/calc-extra-hours-qty";
import { resolveVenueMinimumPrice } from "../../../functions/resolve-minimum-price";
import { quoteServiceLines, sumServiceQuote } from "../../../functions/quote-service-lines";
import { transformDate } from "../../../functions/transform-date";
import {
    formatWallClockTime,
    isWallClockDayInRange,
    wallClockDateIsoFromDate,
    wallClockMonth,
    wallClockWeekdayEn,
    wallClockYear,
} from "../../../functions/wall-clock-datetime";
import { GoalRepositoryInterface } from "../../../repositories/interface/goal-repository-interface";
import { HistoryRepositoryInterface } from "../../../repositories/interface/history-repository-interface";
import { ProposalRepositoryInterface } from "../../../repositories/interface/proposal-repository-interface";
import { ServiceRepositoryInterface } from "../../../repositories/interface/service-repository-interface";
import { VenueRepositoryInterface } from "../../../repositories/interface/venue-repository-interface";

const CONFIRMED_MESSAGE = "Este orçamento já foi confirmado e não pode ser recalculado.";
const MULTI_DAY_MESSAGE = "Este orçamento tem mais de um dia. Para mudar o período, fale com a equipe.";
const SAME_DAY_HOURS_MESSAGE = "A quantidade de horas precisa terminar no mesmo dia.";
const NO_PRICE_MESSAGE = "Este espaço não permite recalcular o orçamento por aqui. Fale com a equipe.";
const HISTORY_ACTION = "Cliente atualizou data, convidados e horas pelo link";

type RecalculatePublicProposalParams = {
    proposalId: string;
    date: string;
    guestNumber: number;
    hours: number;
};

type VenueForRecalc = {
    id: string;
    maxGuest: number | null;
    pricingModel: PricingModel;
    pricePerPerson: number | null;
    pricePerPersonHour: number | null;
    pricePerDay: number | null;
    pricePerPersonDay: number | null;
    standardEventDuration: number | null;
    minimumPrice?: number | null;
    minimumPricePeriods?: { startDay: string; endDay: string; price: number }[] | null;
    seasonalFee?: SeasonalFee[] | null;
};

type Amounts = {
    basePrice: number;
    extraHoursQty: number;
    extraHourPrice: number;
    totalAmount: number;
};

class RecalculatePublicProposalUseCase {
    constructor(
        private venueRepository: VenueRepositoryInterface,
        private serviceRepository: ServiceRepositoryInterface,
        private historyRepository: HistoryRepositoryInterface,
        private proposalRepository: ProposalRepositoryInterface,
        private goalRepository: GoalRepositoryInterface,
    ) { }

    async execute(params: RecalculatePublicProposalParams) {
        const proposal = await this.proposalRepository.getById(params.proposalId);

        if (!proposal) {
            throw new HttpResourceNotFoundError("Orcamento");
        }

        if (proposal.approved || proposal.paid) {
            throw new HttpBadRequestError(CONFIRMED_MESSAGE);
        }

        if (wallClockDateIsoFromDate(proposal.startDate) !== wallClockDateIsoFromDate(proposal.endDate)) {
            throw new HttpBadRequestError(MULTI_DAY_MESSAGE);
        }

        const venue = await this.venueRepository.getById({ venueId: proposal.venueId }) as VenueForRecalc | null;

        if (!venue) {
            throw new HttpResourceNotFoundError("Locacao");
        }

        if (venue.maxGuest && params.guestNumber > venue.maxGuest) {
            throw new HttpBadRequestError(`A capacidade do espaço é de até ${venue.maxGuest} pessoas.`);
        }

        const startHour = formatWallClockTime(proposal.startDate);
        const endHour = endHourOnTheSameDay(startHour, params.hours);
        const { startDate, endDate } = transformDate({
            date: params.date,
            startHour,
            endHour,
        });

        const storedServices = proposalServices(proposal as {
            proposalServices?: { serviceId: string; quantity?: number | null; pricingType?: string | null }[];
        });
        const serviceIds = storedServices.map((item) => item.serviceId);
        const hoursByServiceId: Record<string, number> = {};
        for (const item of storedServices) {
            if (item.pricingType === "PER_HOUR" && typeof item.quantity === "number") {
                hoursByServiceId[item.serviceId] = item.quantity;
            }
        }
        const serviceLines = quoteServiceLines({
            venueId: venue.id,
            serviceIds,
            services: await this.serviceRepository.listForQuote(venue.id, serviceIds),
            guestNumber: params.guestNumber,
            startDate,
            endDate,
            hoursByServiceId,
        });
        const totalAmountService = sumServiceQuote(serviceLines);

        const amounts = await this.calculateAmounts({
            venue,
            startDate,
            endDate,
            guestNumber: params.guestNumber,
            services: totalAmountService,
            proposalType: proposal.type,
        });

        const updated = await this.proposalRepository.update({
            proposalId: proposal.id,
            data: {
                startDate,
                endDate,
                guestNumber: params.guestNumber,
                basePrice: amounts.basePrice,
                extraHoursQty: amounts.extraHoursQty,
                extraHourPrice: amounts.extraHourPrice,
                totalAmount: amounts.totalAmount,
                serviceIds,
                serviceLines,
            },
        });

        if (!updated) {
            throw new Error("Erro na conexao com o banco de dados");
        }

        await this.historyRepository.create({
            proposalId: updated.id,
            action: HISTORY_ACTION,
        });

        return {
            success: true,
            message: "Orçamento atualizado",
            data: {
                id: updated.id,
                startDate,
                endDate,
                guestNumber: params.guestNumber,
                basePrice: amounts.basePrice,
                extraHoursQty: amounts.extraHoursQty,
                extraHourPrice: amounts.extraHourPrice,
                totalAmount: amounts.totalAmount,
            },
        };
    }

    private async calculateAmounts(input: {
        venue: VenueForRecalc;
        startDate: Date;
        endDate: Date;
        guestNumber: number;
        services: number;
        proposalType: ProposalType;
    }): Promise<Amounts> {
        if (input.proposalType === "BARTER" || input.venue.pricingModel === "TIERED") {
            throw new HttpBadRequestError(NO_PRICE_MESSAGE);
        }

        const duration = calcEventDuration(input.startDate, input.endDate);
        const { unitPrice, hasMonthlyRevenue } = await this.adjustUnitPrice(input.venue, input.startDate);

        if (input.venue.pricingModel === "PER_PERSON" && input.venue.pricePerPerson) {
            return this.perPersonAmounts(input.guestNumber, unitPrice, duration, input.venue, input.startDate, input.services);
        }

        if (input.venue.pricingModel === "PER_PERSON_HOUR" && input.venue.pricePerPersonHour) {
            if (hasMonthlyRevenue) {
                return this.perPersonAmounts(input.guestNumber, unitPrice, duration, input.venue, input.startDate, input.services);
            }
            const basePrice = duration * (input.guestNumber * unitPrice);
            const withMinimum = applyMinimum({
                basePrice,
                extraHoursQty: 0,
                extraHourPrice: duration ? basePrice / duration : 0,
                services: input.services,
                venue: input.venue,
                startDate: input.startDate,
            });
            return withMinimum;
        }

        if (input.venue.pricingModel === "PER_DAY" && input.venue.pricePerDay) {
            return applyMinimum({
                basePrice: unitPrice,
                extraHoursQty: 0,
                extraHourPrice: 0,
                services: input.services,
                venue: input.venue,
                startDate: input.startDate,
            });
        }

        if (input.venue.pricingModel === "PER_PERSON_DAY" && input.venue.pricePerPersonDay) {
            return applyMinimum({
                basePrice: unitPrice * input.guestNumber,
                extraHoursQty: 0,
                extraHourPrice: 0,
                services: input.services,
                venue: input.venue,
                startDate: input.startDate,
            });
        }

        throw new HttpBadRequestError(NO_PRICE_MESSAGE);
    }

    private perPersonAmounts(
        guestNumber: number,
        unitPrice: number,
        duration: number,
        venue: VenueForRecalc,
        startDate: Date,
        services: number,
    ): Amounts {
        const basePrice = guestNumber * unitPrice;
        const extraHoursQty = venue.standardEventDuration
            ? calcExtraHoursQty(duration, venue.standardEventDuration)
            : 0;
        return applyMinimum({
            basePrice,
            extraHoursQty,
            extraHourPrice: calcExtraHourPrice(basePrice),
            services,
            venue,
            startDate,
        });
    }

    private async adjustUnitPrice(venue: VenueForRecalc, startDate: Date) {
        const catalogPrice = catalogUnitPrice(venue);
        if (catalogPrice == null) {
            throw new HttpBadRequestError(NO_PRICE_MESSAGE);
        }

        let unitPrice = applyWallClockSeason(catalogPrice, venue.seasonalFee, startDate);
        const monthlyRevenue = await this.proposalRepository.monthlyRevenueAnalysis({
            venueId: venue.id,
            year: wallClockYear(startDate),
            month: wallClockMonth(startDate),
            approved: true,
        });

        if (!monthlyRevenue) {
            return { unitPrice, hasMonthlyRevenue: false };
        }

        const goal = await this.goalRepository.findByVenueAndRevenue({
            venueId: venue.id,
            monthlyRevenue,
            targetMonth: String(wallClockMonth(startDate)),
        });

        if (goal?.increasePercent) {
            unitPrice += (unitPrice * goal.increasePercent) / 100;
        }

        return { unitPrice, hasMonthlyRevenue: true };
    }
}

function catalogUnitPrice(venue: VenueForRecalc): number | null {
    if (venue.pricingModel === "PER_PERSON") return venue.pricePerPerson;
    if (venue.pricingModel === "PER_PERSON_HOUR") return venue.pricePerPersonHour;
    if (venue.pricingModel === "PER_DAY") return venue.pricePerDay;
    if (venue.pricingModel === "PER_PERSON_DAY") return venue.pricePerPersonDay;
    return null;
}

function applyWallClockSeason(
    unitPrice: number,
    seasonalFee: SeasonalFee[] | null | undefined,
    startDate: Date,
): number {
    if (!seasonalFee?.length) {
        return unitPrice;
    }

    const eventDayOfWeek = wallClockWeekdayEn(startDate);
    const totalAdjustment = seasonalFee.reduce((adjustment, fee) => {
        const feeValue = fee.type === "SURCHARGE" ? fee.fee : -fee.fee;
        const isInSeason = fee.startDay && fee.endDay
            ? isWallClockDayInRange(startDate, fee.startDay, fee.endDay)
            : false;
        const isAffectedDay = fee.affectedDays
            ? fee.affectedDays.split(",").map((day) => day.trim().toLowerCase()).includes(eventDayOfWeek)
                || fee.affectedDays.includes("all")
            : false;
        return adjustment + (isInSeason || isAffectedDay ? feeValue : 0);
    }, 0);

    return unitPrice + (unitPrice * totalAdjustment) / 100;
}

function applyMinimum(input: {
    basePrice: number;
    extraHoursQty: number;
    extraHourPrice: number;
    services: number;
    venue: VenueForRecalc;
    startDate: Date;
}): Amounts {
    const total = input.basePrice + input.services + (input.extraHourPrice * input.extraHoursQty);
    const minimum = resolveVenueMinimumPrice(input.venue, input.startDate);

    if (minimum && total < minimum) {
        return {
            basePrice: minimum,
            extraHoursQty: 0,
            extraHourPrice: 0,
            totalAmount: minimum + input.services,
        };
    }

    return {
        basePrice: input.basePrice,
        extraHoursQty: input.extraHoursQty,
        extraHourPrice: input.extraHourPrice,
        totalAmount: total,
    };
}

function endHourOnTheSameDay(startHour: string, hours: number): string {
    const [hourText, minuteText] = startHour.split(":");
    const hour = Number(hourText);
    const minute = Number(minuteText);
    const endHour = hour + hours;

    if (!Number.isInteger(hour) || !Number.isInteger(minute) || endHour > 23) {
        throw new HttpBadRequestError(SAME_DAY_HOURS_MESSAGE);
    }

    return `${String(endHour).padStart(2, "0")}:${String(minute).padStart(2, "0")}`;
}

function proposalServices(proposal: {
    proposalServices?: { serviceId: string; quantity?: number | null; pricingType?: string | null }[];
}) {
    return proposal.proposalServices ?? [];
}

export { RecalculatePublicProposalUseCase };
