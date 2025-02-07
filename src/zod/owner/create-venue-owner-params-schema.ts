import { z } from "zod";

export const createVenueOwnerSchema = z.object({
    cep: z.string(),
    pix: z.string(),
    cpf: z.string(),
    city: z.string(),
    state: z.string(),
    street: z.string(),
    venueId: z.string(),
    bankName: z.string(),
    bankAgency: z.string(),
    streetNumber: z.string(),
    neighborhood: z.string(),
    completeName: z.string(),
    rg: z.string().optional(),
    organizationId: z.string(),
    bankAccountNumber: z.string(),
    complement: z.string().optional(),
});

export type CreateVenueOwnerRequestParams = z.infer<typeof createVenueOwnerSchema>;

