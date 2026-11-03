import { SeasonalFee } from "@prisma/client";
import { format, isWithinInterval, parse, setYear } from "date-fns";
import { GoalRepositoryInterface } from "../repositories/interface/goal-repository-interface";
import { ProposalRepositoryInterface } from "../repositories/interface/proposal-repository-interface";

export function applySeasonalFeeToUnitPrice(
    unitPrice: number,
    seasonalFee: SeasonalFee[] | null | undefined,
    startDate: Date,
): number {
    if (!seasonalFee?.length) {
        return unitPrice;
    }

    const year = startDate.getFullYear();
    const eventDayOfWeek = format(startDate, "EEEE").toLowerCase();

    const totalAdjustment = seasonalFee.reduce((adjustment, fee) => {
        const isSurcharge = fee.type === "SURCHARGE";
        const feeValue = isSurcharge ? fee.fee : -fee.fee;
        const start = setYear(parse(fee.startDay ?? "", "dd/MM", new Date()), year);
        let end = setYear(parse(fee.endDay ?? "", "dd/MM", new Date()), year);
        if (end < start) {
            end = setYear(parse(fee.endDay ?? "", "dd/MM", new Date()), year + 1);
        }
        const isInSeason = fee.startDay && fee.endDay
            ? isWithinInterval(startDate, { start, end })
            : false;

        const isAffectedDay = fee.affectedDays
            ? fee.affectedDays.split(",").map(d => d.trim().toLowerCase()).includes(eventDayOfWeek) || fee.affectedDays.includes("all")
            : false;

        return adjustment + (isInSeason || isAffectedDay ? feeValue : 0);
    }, 0);

    return unitPrice + (unitPrice * totalAdjustment) / 100;
}

export async function adjustProposalUnitPrice(params: {
    unitPrice: number;
    seasonalFee: SeasonalFee[] | null | undefined;
    startDate: Date;
    venueId: string;
    proposalRepository: Pick<ProposalRepositoryInterface, "monthlyRevenueAnalysis">;
    goalRepository: Pick<GoalRepositoryInterface, "findByVenueAndRevenue">;
}): Promise<{ unitPrice: number; hasMonthlyRevenue: boolean }> {
    const priceAfterSeason = applySeasonalFeeToUnitPrice(
        params.unitPrice,
        params.seasonalFee,
        params.startDate,
    );

    const monthlyRevenue = await params.proposalRepository.monthlyRevenueAnalysis({
        venueId: params.venueId,
        year: params.startDate.getFullYear(),
        month: params.startDate.getMonth() + 1,
        approved: true,
    });

    if (!monthlyRevenue) {
        return { unitPrice: priceAfterSeason, hasMonthlyRevenue: false };
    }

    const goal = await params.goalRepository.findByVenueAndRevenue({
        venueId: params.venueId,
        monthlyRevenue,
        targetMonth: String(params.startDate.getMonth() + 1),
    });

    if (!goal?.increasePercent) {
        return { unitPrice: priceAfterSeason, hasMonthlyRevenue: true };
    }

    return {
        unitPrice: priceAfterSeason + (priceAfterSeason * goal.increasePercent) / 100,
        hasMonthlyRevenue: true,
    };
}
