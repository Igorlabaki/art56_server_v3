import { z } from "zod";
import { requiredProposalEmail } from "./proposal-email-schema";

export const updatePersonalInfoProposalSchema = z.object({
    proposalId: z.string(),
    data: z.object({
        cpf: z.string(),
        cep: z.string(),
        city: z.string(),
        state: z.string(),
        street: z.string(),
        streetNumber: z.string(),
        neighborhood: z.string(),
        rg: z.string().optional(),
        adressComplement: z.string().optional(),
        cnpj: z.string().optional(),
        completeClientName: z.string(),
        completeCompanyName: z.string().optional(),
        email: requiredProposalEmail,
    })
});

export type UpdatePersonalInfoProposalSchema = z.infer<typeof updatePersonalInfoProposalSchema>;