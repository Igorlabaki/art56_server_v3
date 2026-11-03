import { z } from "zod";

export const listMinimumPricePeriodParamSchema = z.object({
    venueId: z.string().min(1),
});

export type ListMinimumPricePeriodRequestParam = z.infer<typeof listMinimumPricePeriodParamSchema>;
