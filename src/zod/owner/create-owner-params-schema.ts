import { z } from "zod";

export const createOrganizationOwnerSchema = z.object({
    cep: z.string(),
    pix: z.string(),
    cpf: z.string(),
    city: z.string(),
    state: z.string(),
    street: z.string(),
    bankName: z.string(),
    bankAgency: z.string(),
    streetNumber: z.string(),
    completeName: z.string(),
    neighborhood: z.string(),
    rg: z.string().optional(),
    organizationId: z.string(),
    bankAccountNumber: z.string(),
    complement: z.string().optional(),
    venueIds: z.array(z.string()).optional(),
});

export type CreateOrganizationOwnerRequestParams = z.infer<typeof createOrganizationOwnerSchema>;

