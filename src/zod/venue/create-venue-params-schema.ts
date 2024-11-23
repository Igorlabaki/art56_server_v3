import { z } from "zod";

export const createVenueSchema = z.object({
    name: z.string(),
    city: z.string(),
    cep: z.string(),
    state: z.string(),
    street: z.string(),
    complement: z.string(),
    streetNumber: z.string(),
    neighborhood: z.string(),
    organizationId: z.string(),
});

export type CreateVenueRequestParams = z.infer<typeof createVenueSchema>;

