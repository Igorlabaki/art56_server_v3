import { MinimumPricePeriod } from "@prisma/client";
import { CreateMinimumPricePeriodRequestParams } from "../../zod/minimumPricePeriod/create-minimum-price-period-params-schema";
import { UpdateMinimumPricePeriodRequestParams } from "../../zod/minimumPricePeriod/update-minimum-price-period-params-schema";

export interface MinimumPricePeriodRepositoryInterface {
    create: (params: CreateMinimumPricePeriodRequestParams) => Promise<MinimumPricePeriod>;
    list: (venueId: string) => Promise<MinimumPricePeriod[]>;
    getById: (id: string) => Promise<MinimumPricePeriod | null>;
    update: (params: UpdateMinimumPricePeriodRequestParams) => Promise<MinimumPricePeriod>;
    delete: (id: string) => Promise<MinimumPricePeriod>;
}
