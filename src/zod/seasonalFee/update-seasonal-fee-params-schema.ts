import { z } from "zod";

export const updateSeasonalFeeSchema = z.object({
    venueId: z.string(),
    seasonalFeeId: z.string(),
    data: z.object({
        fee:  z.number(),
        title:  z.string(),
        endDay:  z.string().optional(),
        startDay:  z.string().optional(),
        affectedDays: z.string().optional(),
        type: z.enum(["SURCHARGE","DISCOUNT"]),
    }),
});

export type UpdateSeasonalFeeRequestParams = z.infer<typeof updateSeasonalFeeSchema>;