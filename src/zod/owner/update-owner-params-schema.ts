import { z } from "zod";
import { ownerDocumentFieldsSchema } from "./owner-document-fields-schema";

// Sem `organizationId`: o proprietario nunca troca de organizacao (o z.object descarta a chave).
export const updateOwnerSchema = z.object({
    ownerId: z.string(),
    data: z.object({
        ...ownerDocumentFieldsSchema,
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
        rg: z.string().optional(),
        bankAccountNumber: z.string().optional(),
        venueIds: z.array(z.string()).optional(),
    }),
});

export type UpdateOwnerSchema = z.infer<typeof updateOwnerSchema>;
