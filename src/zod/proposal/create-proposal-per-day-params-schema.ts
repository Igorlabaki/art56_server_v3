import { z } from "zod";
import { optionalProposalEmail } from "./proposal-email-schema";
import { EVENT_CATEGORIES } from "../../functions/event-category";

export const createProposalPerDayRequestParamsSchema = z.object({
    completeClientName: z.string(),
    venueId: z.string(),
    endHour: z.string(),
    endDay: z.string(),
    startDay: z.string(),
    whatsapp: z.string(),
    startHour: z.string(),
    description: z.string(),
    knowsVenue: z.boolean(),
    guestNumber:  z.string(),
    email: optionalProposalEmail,
    userId: z.string().optional(),
    serviceIds: z.array(z.string()),
    serviceHours: z.array(z.object({
        serviceId: z.string(),
        hours: z.number().int().min(0).max(8760),
    })).max(100).optional(),
    totalAmountInput: z.string().optional(),
    type: z.enum(["PRODUCTION", "BARTER", "OTHER", "EVENT","OVERNIGHT"]), 
    eventCategory: z.enum(EVENT_CATEGORIES).nullable().optional(),
    trafficSource: z.enum(["AIRBNB", "GOOGLE", "INSTAGRAM", "TIKTOK", "OTHER", "FRIEND", "FACEBOOK"]),
});

export type CreateProposalPerDayRequestParamsSchema = z.infer<typeof createProposalPerDayRequestParamsSchema>;