import { z } from "zod";
import { minimumPricePeriodFieldsSchema } from "./day-month-schema";

export const createMinimumPricePeriodSchema = minimumPricePeriodFieldsSchema.extend({
    venueId: z.string().min(1),
});

export type CreateMinimumPricePeriodRequestParams = z.infer<typeof createMinimumPricePeriodSchema>;
