import { z } from "zod";

export const listVenueRequestQuerySchema = z.object({
    organizationId:z.string(),
    name: z.string().optional(),
})

export type ListVenueRequestQuerySchema = z.infer<typeof listVenueRequestQuerySchema>;

