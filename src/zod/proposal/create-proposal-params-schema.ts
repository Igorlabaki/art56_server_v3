import { z } from "zod";

export const createProposalRequestParamsSchema = z.object({
    date: z.string(),
    name: z.string(),
    guests: z.number(),
    venueId: z.string(),
    endHour: z.string(),
    whatsapp: z.string(),
    startHour: z.string(),
    description: z.string(),
    knowsVenue: z.boolean(),
    email: z.string().email(),
    termsAccepted: z.boolean(),
    serviceIds: z.array(z.string()),
    totalAmountInput: z.number().optional(),
    type: z.enum(["PRODUCTION", "BARTER", "OTHER", "EVENT"]), 
    trafficSource: z.enum(["AIRBNB", "GOOGLE", "INSTAGRAM", "TIKTOK", "OUTROS", "AMIGO", "FACEBOOK"]),
});

export type CreateProposalRequestParamsSchema = z.infer<typeof createProposalRequestParamsSchema>;