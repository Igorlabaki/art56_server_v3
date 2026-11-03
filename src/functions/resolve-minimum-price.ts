import { isWallClockDayInRange } from "./wall-clock-datetime";

export type MinimumPricePeriodRange = {
    startDay: string;
    endDay: string;
    price: number;
};

export function resolveMinimumPrice(params: {
    minimumPrice?: number | null;
    periods?: MinimumPricePeriodRange[] | null;
    startDate: Date;
}): number {
    let best = 0;

    for (const period of params.periods ?? []) {
        if (!period.price || period.price <= 0 || !period.startDay || !period.endDay) {
            continue;
        }
        if (!isWallClockDayInRange(params.startDate, period.startDay, period.endDay)) {
            continue;
        }
        if (period.price > best) {
            best = period.price;
        }
    }

    if (best > 0) {
        return best;
    }

    return params.minimumPrice && params.minimumPrice > 0 ? params.minimumPrice : 0;
}

export function resolveVenueMinimumPrice(
    venue: {
        minimumPrice?: number | null;
        minimumPricePeriods?: MinimumPricePeriodRange[] | null;
    },
    startDate: Date,
): number {
    return resolveMinimumPrice({
        minimumPrice: venue.minimumPrice,
        periods: venue.minimumPricePeriods,
        startDate,
    });
}
