import { z } from "zod";

export const createNotificationSchema = z.object({
    content: z.string(),
    venueId: z.string(),
    isRead: z.boolean().optional(),
    dataEventId: z.string().optional(),
    type: z.enum(["VISIT", "EVENT", "ALERT", "PROPOSAL"]), 
});

export type CreateNotificationRequestParams = z.infer<typeof createNotificationSchema>;