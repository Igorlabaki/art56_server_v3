import { z } from "zod";

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
        email: z.string().email(),
        totalAmountInput: z.string(),
        userId: z.string().optional(),
        serviceIds: z.array(z.string()),
        adressComplement: z.string().optional(),
        type: z.enum(["EVENT" , "OTHER" , "BARTER" , "PRODUCTION"]), 
        trafficSource: z.enum(["AIRBNB" , "GOOGLE" , "INSTAGRAM" , "TIKTOK" , "OTHER" , "FRIEND" , "FACEBOOK"])
    })
});

export type UpdateProposalPerPersonRequestParams = z.infer<typeof updateProposalPerPersonRequestParams>;