import { z } from "zod";

export const deleteMinimumPricePeriodParamSchema = z.object({
    id: z.string().min(1),
});

export type DeleteMinimumPricePeriodRequestParam = z.infer<typeof deleteMinimumPricePeriodParamSchema>;
