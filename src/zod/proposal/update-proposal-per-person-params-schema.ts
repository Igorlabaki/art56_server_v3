import { z } from "zod";
import { optionalProposalEmail } from "./proposal-email-schema";
import { EVENT_CATEGORIES } from "../../functions/event-category";

export const updateProposalPerPersonRequestParams = z.object({
    proposalId: z.string(),
    data: z.object({
        completeClientName: z.string(),
        completeCompanyName: z.string().optional(),
        date: z.string(),
        venueId: z.string(),
        endHour: z.string(),
        whatsapp: z.string(),
        startHour: z.string(),
        guestNumber: z.string(),
        description: z.string(),
        knowsVenue: z.boolean(),
        email: optionalProposalEmail,
        totalAmountInput: z.string(),
        userId: z.string().optional(),
        serviceIds: z.array(z.string()),
        serviceHours: z.array(z.object({
            serviceId: z.string(),
            hours: z.number().int().min(0).max(8760),
        })).max(100).optional(),
        adressComplement: z.string().optional(),
        type: z.enum(["EVENT" , "OTHER" , "BARTER" , "PRODUCTION"]), 
        eventCategory: z.enum(EVENT_CATEGORIES).nullable().optional(),
        trafficSource: z.enum(["AIRBNB" , "GOOGLE" , "INSTAGRAM" , "TIKTOK" , "OTHER" , "FRIEND" , "FACEBOOK"])
    })
});

export type UpdateProposalPerPersonRequestParams = z.infer<typeof updateProposalPerPersonRequestParams>;