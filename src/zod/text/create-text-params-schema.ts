import { z } from "zod";

export const createTextSchema = z.object({
    area: z.string(),
    text: z.string(),
    venueId: z.string(),
    position: z.number(),
    title: z.string().optional(),
});

export type CreateTextRequestParams = z.infer<typeof createTextSchema>;