import { z } from "zod";

export const createProposalPerPersonRequestParamsSchema = z.object({
    date: z.string(),
    completeClientName: z.string(),
    venueId: z.string(),
    endHour: z.string(),
    whatsapp: z.string(),
    startHour: z.string(),
    guestNumber: z.string(),
    description: z.string(),
    knowsVenue: z.boolean(),
    email: z.string().email(),
    userId: z.string().optional(),
    serviceIds: z.array(z.string()),
    totalAmountInput: z.string().optional(),
    eventDefaultDuration: z.number().optional(),
    type: z.enum(["PRODUCTION", "BARTER", "OTHER", "EVENT"]), 
    trafficSource: z.enum(["AIRBNB", "GOOGLE", "INSTAGRAM", "TIKTOK", "OTHER", "FRIEND", "FACEBOOK"]),
});

export type CreateProposalPerPersonRequestParamsSchema = z.infer<typeof createProposalPerPersonRequestParamsSchema>;