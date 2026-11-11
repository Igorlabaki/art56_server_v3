import { z } from "zod";
import { optionalProposalEmail } from "./proposal-email-schema";
import { EVENT_CATEGORIES } from "../../functions/event-category";
import { serviceCourtesySchema } from "./service-courtesy-schema";

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
    email: optionalProposalEmail,
    userId: z.string().optional(),
    serviceIds: z.array(z.string()),
    serviceHours: z.array(z.object({
        serviceId: z.string(),
        hours: z.number().int().min(0).max(8760),
    })).max(100).optional(),
    serviceCourtesy: serviceCourtesySchema,
    totalAmountInput: z.string().optional(),
    discountPercent: z.number().optional(),
    type: z.enum(["PRODUCTION", "BARTER", "OTHER", "EVENT"]), 
    eventCategory: z.enum(EVENT_CATEGORIES).nullable().optional(),
    trafficSource: z.enum(["AIRBNB", "GOOGLE", "INSTAGRAM", "TIKTOK", "OTHER", "FRIEND", "FACEBOOK"]),
});

export type CreateProposalPerPersonRequestParamsSchema = z.infer<typeof createProposalPerPersonRequestParamsSchema>;