import { z } from "zod";

export const createAttachemntDbSchema = z.object({
    title: z.string(),
    text: z.string(),
    venueId: z.string(),
    organizationId: z.string(),
});

export type CreateAttachemntDbSchema = z.infer<typeof createAttachemntDbSchema>;