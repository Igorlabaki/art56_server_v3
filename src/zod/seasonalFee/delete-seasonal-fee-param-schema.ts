import { z } from "zod";

export const deleteSeasonalFeeRequestParamSchema = z.object({
    seasonalFeeId: z.string(),
})

export type DeleteSeasonalFeeRequestParamSchema = z.infer<typeof deleteSeasonalFeeRequestParamSchema>;

