import { z } from "zod";

export const updateProposalInDbParam = z.object({
    proposalId: z.string(),
    data: z.object({
        completeClientName: z.string().optional(),
        completeCompanyName: z.string().optional(),
        endDate: z.date().optional(),
        startDate: z.date().optional(),
        cpf: z.string().optional(),
        cnpj: z.string().optional(),
        whatsapp: z.string().optional(),
        approved: z.boolean().optional(),
        basePrice: z.number().optional(),
        amountPaid: z.number().optional(),
        guestNumber: z.number().optional(),
        totalAmount: z.number().optional(),
        description: z.string().optional(),
        knowsVenue: z.boolean().optional(),
        adressComplement: z.string().optional(),
        email: z.string().email().optional(),
        extraHoursQty: z.number().optional(),
        extraHourPrice: z.number().optional(),
        serviceIds: z.array(z.string()).optional(),
        type: z.enum(["PRODUCTION", "BARTER", "OTHER", "EVENT"]).optional(),
        trafficSource: z.enum(["AIRBNB", "GOOGLE", "INSTAGRAM", "TIKTOK", "OTHER", "FRIEND", "FACEBOOK"]).optional(),
    })
});

export type UpdateProposalInDbParam = z.infer<typeof updateProposalInDbParam>;
