import { z } from "zod";

export const updateOwnerSchema = z.object({
    ownerId: z.string(),
    data: z.object({
        cep: z.string().optional(),
        pix: z.string().optional(),
        cpf: z.string().optional(),
        city: z.string().optional(),
        state: z.string().optional(),
        street: z.string().optional(),
        bankName: z.string().optional(),
        complement: z.string().optional(),
        bankAgency: z.string().optional(),
        streetNumber: z.string().optional(),
        completeName: z.string().optional(),
        neighborhood: z.string().optional(),
        rg: z.string().optional().optional(),
        organizationId: z.string().optional(),
        bankAccountNumber: z.string().optional(),
    }),
});

export type UpdateOwnerSchema = z.infer<typeof updateOwnerSchema>;