import { z } from "zod";

export const updatePersonalInfoProposalSchema = z.object({
    proposalId: z.string(),
    data: z.object({
        cpf: z.string(),
        cep: z.string(),
        city: z.string(),
        state: z.string(),
        street: z.string(),
        completeName: z.string(),
        streetNumber: z.string(),
        neighborhood: z.string(),
        rg: z.string().optional(),
    })
});

export type UpdatePersonalInfoProposalSchema = z.infer<typeof updatePersonalInfoProposalSchema>;