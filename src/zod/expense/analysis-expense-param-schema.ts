import { z } from "zod";

export const analysisExpenseRequestParamSchema = z.object({
    year: z.string(),
    venueId: z.string(),
})

export type AnalysisExpenseRequestParamSchema = z.infer<typeof analysisExpenseRequestParamSchema>;

