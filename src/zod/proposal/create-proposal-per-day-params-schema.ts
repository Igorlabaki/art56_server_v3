import { z } from "zod";

export const createProposalPerDayRequestParamsSchema = z.object({
    name: z.string(),
    venueId: z.string(),
    endHour: z.string(),
    endDay: z.string(),
    startDay: z.string(),
    whatsapp: z.string(),
    startHour: z.string(),
    description: z.string(),
    knowsVenue: z.boolean(),
    guestNumber:  z.string(),
    email: z.string().email(),
    userId: z.string().optional(),
    serviceIds: z.array(z.string()),
    totalAmountInput: z.string().optional(),
    type: z.enum(["PRODUCTION", "BARTER", "OTHER", "EVENT","OVERNIGHT"]), 
    trafficSource: z.enum(["AIRBNB", "GOOGLE", "INSTAGRAM", "TIKTOK", "OTHER", "FRIEND", "FACEBOOK"]),
});

export type CreateProposalPerDayRequestParamsSchema = z.infer<typeof createProposalPerDayRequestParamsSchema>;