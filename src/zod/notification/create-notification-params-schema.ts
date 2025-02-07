import { z } from "zod";

export const createNotificationSchema = z.object({
    content: z.string(),
    venueId: z.string(),
    isRead: z.boolean().optional(),
    dataEventId: z.string().optional(),
    proposalId: z.string().optional(),
    type: z.enum(["VISIT", "EVENT", "PROPOSAL","OVERNIGHT", "BARTER", "PRODUCTION", "OTHER"]), 
});

export type CreateNotificationRequestParams = z.infer<typeof createNotificationSchema>;