import { z } from "zod";

export const createOwnerSchema = z.object({
    rg: z.string(),
    cpf: z.string(),
    pix: z.string(),
    city: z.string(),
    state: z.string(),
    street: z.string(),
    cep: z.string(),
    venueId: z.string(),
    complement: z.string(),
    streetNumber: z.string(),
    completeName: z.string(),
    neighborhood: z.string(),
});

export type CreateOwnerRequestParams = z.infer<typeof createOwnerSchema>;

