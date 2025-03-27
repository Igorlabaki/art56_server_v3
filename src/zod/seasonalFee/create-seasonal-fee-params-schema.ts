import { z } from "zod";

export const createSeasonalFeeSchema = z.object({
    fee: z.number(),
    title: z.string(),
    venueId: z.string(),
    endDay: z.string().optional(),
    startDay: z.string().optional(),
    affectedDays: z.string().optional(),
    type: z.enum(["SURCHARGE","DISCOUNT"]),
});

export type CreateSeasonalFeeRequestParams = z.infer<typeof createSeasonalFeeSchema>;