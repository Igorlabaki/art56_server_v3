import { z } from "zod";

export const listNotificationRequestQuerySchema = z.object({
    venueId: z.string(),
})

export type ListNotificationRequestQuerySchema = z.infer<typeof listNotificationRequestQuerySchema>;

