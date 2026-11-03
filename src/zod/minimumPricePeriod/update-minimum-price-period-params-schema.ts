import { z } from "zod";
import { minimumPricePeriodFieldsSchema } from "./day-month-schema";

export const updateMinimumPricePeriodSchema = minimumPricePeriodFieldsSchema.extend({
    id: z.string().min(1),
});

export type UpdateMinimumPricePeriodRequestParams = z.infer<typeof updateMinimumPricePeriodSchema>;
