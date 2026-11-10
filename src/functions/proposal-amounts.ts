import { PricingModel, SeasonalFee } from "@prisma/client";
import { GoalRepositoryInterface } from "../repositories/interface/goal-repository-interface";
import { ProposalRepositoryInterface } from "../repositories/interface/proposal-repository-interface";
import { calcEventDuration } from "./calc-event-duration";
import { calcExtraHourPrice } from "./calc-extra-hour-price";
import { calcExtraHoursQty } from "./calc-extra-hours-qty";
import { MinimumPricePeriodRange, resolveVenueMinimumPrice } from "./resolve-minimum-price";
import {
    isWallClockDayInRange,
    wallClockMonth,
    wallClockWeekdayEn,
    wallClockYear,
} from "./wall-clock-datetime";

export type VenueForAmounts = {
    id: string;
    pricingModel: PricingModel;
    pricePerPerson?: number | null;
    pricePerPersonHour?: number | null;
    pricePerDay?: number | null;
    pricePerPersonDay?: number | null;
    standardEventDuration?: number | null;
    minimumPrice?: number | null;
    minimumPricePeriods?: MinimumPricePeriodRange[] | null;
    seasonalFee?: SeasonalFee[] | null;
};

export type ProposalAmounts = {
    basePrice: number;
    extraHoursQty: number;
    extraHourPrice: number;
    totalAmount: number;
    minimumApplied: boolean;
};

export type AdjustedUnitPrice = {
    unitPrice: number;
    hasMonthlyRevenue: boolean;
};

export function catalogUnitPrice(venue: VenueForAmounts): number | null {
    if (venue.pricingModel === "PER_PERSON") return venue.pricePerPerson ?? null;
    if (venue.pricingModel === "PER_PERSON_HOUR") return venue.pricePerPersonHour ?? null;
    if (venue.pricingModel === "PER_DAY") return venue.pricePerDay ?? null;
    if (venue.pricingModel === "PER_PERSON_DAY") return venue.pricePerPersonDay ?? null;
    return null;
}

export function applyWallClockSeason(
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

export async function adjustVenueUnitPrice(
    venue: VenueForAmounts,
    startDate: Date,
    repositories: {
        proposalRepository: Pick<ProposalRepositoryInterface, "monthlyRevenueAnalysis">;
        goalRepository: Pick<GoalRepositoryInterface, "findByVenueAndRevenue">;
    },
): Promise<AdjustedUnitPrice | null> {
    const catalogPrice = catalogUnitPrice(venue);
    if (catalogPrice == null) {
        return null;
    }

    let unitPrice = applyWallClockSeason(catalogPrice, venue.seasonalFee, startDate);
    const monthlyRevenue = await repositories.proposalRepository.monthlyRevenueAnalysis({
        venueId: venue.id,
        year: wallClockYear(startDate),
        month: wallClockMonth(startDate),
        approved: true,
    });

    if (!monthlyRevenue) {
        return { unitPrice, hasMonthlyRevenue: false };
    }

    const goal = await repositories.goalRepository.findByVenueAndRevenue({
        venueId: venue.id,
        monthlyRevenue,
        targetMonth: String(wallClockMonth(startDate)),
    });

    if (goal?.increasePercent) {
        unitPrice += (unitPrice * goal.increasePercent) / 100;
    }

    return { unitPrice, hasMonthlyRevenue: true };
}

export function calcProposalAmounts(input: {
    venue: VenueForAmounts;
    unitPrice: number;
    hasMonthlyRevenue: boolean;
    startDate: Date;
    endDate: Date;
    guestNumber: number;
    services: number;
}): ProposalAmounts | null {
    const { venue, unitPrice, guestNumber, startDate, services } = input;
    const duration = calcEventDuration(input.startDate, input.endDate);

    if (venue.pricingModel === "PER_PERSON" && venue.pricePerPerson) {
        return perPersonAmounts(guestNumber, unitPrice, duration, venue, startDate, services);
    }

    if (venue.pricingModel === "PER_PERSON_HOUR" && venue.pricePerPersonHour) {
        if (input.hasMonthlyRevenue) {
            return perPersonAmounts(guestNumber, unitPrice, duration, venue, startDate, services);
        }
        const basePrice = duration * (guestNumber * unitPrice);
        return applyMinimum({
            basePrice,
            extraHoursQty: 0,
            extraHourPrice: duration ? basePrice / duration : 0,
            services,
            venue,
            startDate,
        });
    }

    if (venue.pricingModel === "PER_DAY" && venue.pricePerDay) {
        return applyMinimum({
            basePrice: unitPrice,
            extraHoursQty: 0,
            extraHourPrice: 0,
            services,
            venue,
            startDate,
        });
    }

    if (venue.pricingModel === "PER_PERSON_DAY" && venue.pricePerPersonDay) {
        return applyMinimum({
            basePrice: unitPrice * guestNumber,
            extraHoursQty: 0,
            extraHourPrice: 0,
            services,
            venue,
            startDate,
        });
    }

    return null;
}

export function applyMinimum(input: {
    basePrice: number;
    extraHoursQty: number;
    extraHourPrice: number;
    services: number;
    venue: VenueForAmounts;
    startDate: Date;
}): ProposalAmounts {
    const total = input.basePrice + input.services + (input.extraHourPrice * input.extraHoursQty);
    const minimum = resolveVenueMinimumPrice(input.venue, input.startDate);

    if (minimum && total < minimum) {
        return {
            basePrice: minimum,
            extraHoursQty: 0,
            extraHourPrice: 0,
            totalAmount: minimum + input.services,
            minimumApplied: true,
        };
    }

    return {
        basePrice: input.basePrice,
        extraHoursQty: input.extraHoursQty,
        extraHourPrice: input.extraHourPrice,
        totalAmount: total,
        minimumApplied: false,
    };
}

function perPersonAmounts(
    guestNumber: number,
    unitPrice: number,
    duration: number,
    venue: VenueForAmounts,
    startDate: Date,
    services: number,
): ProposalAmounts {
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
