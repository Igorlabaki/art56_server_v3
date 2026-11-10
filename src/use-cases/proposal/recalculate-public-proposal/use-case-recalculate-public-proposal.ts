import { ProposalType } from "@prisma/client";
import { HttpBadRequestError } from "../../../errors/errors-type/htttp-bad-request-error";
import { HttpResourceNotFoundError } from "../../../errors/errors-type/http-resource-not-found-error";
import {
    adjustVenueUnitPrice,
    calcProposalAmounts,
    ProposalAmounts,
    VenueForAmounts,
} from "../../../functions/proposal-amounts";
import { quoteServiceLines, sumServiceQuote } from "../../../functions/quote-service-lines";
import { transformDate } from "../../../functions/transform-date";
import {
    formatWallClockTime,
    wallClockDateIsoFromDate,
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

type VenueForRecalc = VenueForAmounts & {
    maxGuest: number | null;
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
    }): Promise<ProposalAmounts> {
        if (input.proposalType === "BARTER" || input.venue.pricingModel === "TIERED") {
            throw new HttpBadRequestError(NO_PRICE_MESSAGE);
        }

        const adjusted = await adjustVenueUnitPrice(input.venue, input.startDate, {
            proposalRepository: this.proposalRepository,
            goalRepository: this.goalRepository,
        });
        if (!adjusted) {
            throw new HttpBadRequestError(NO_PRICE_MESSAGE);
        }

        const amounts = calcProposalAmounts({
            venue: input.venue,
            unitPrice: adjusted.unitPrice,
            hasMonthlyRevenue: adjusted.hasMonthlyRevenue,
            startDate: input.startDate,
            endDate: input.endDate,
            guestNumber: input.guestNumber,
            services: input.services,
        });
        if (!amounts) {
            throw new HttpBadRequestError(NO_PRICE_MESSAGE);
        }

        return amounts;
    }
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
