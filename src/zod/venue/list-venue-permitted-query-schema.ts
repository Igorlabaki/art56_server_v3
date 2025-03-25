import { z } from "zod";

export const listPermittedVenueRequestQuerySchema = z.object({
    userId: z.string(),
    organizationId:z.string(),
    name: z.string().optional(),
})

export type ListPermittedVenueRequestQuerySchema = z.infer<typeof listPermittedVenueRequestQuerySchema>;

