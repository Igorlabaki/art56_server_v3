import { z } from "zod";

export const listOwnerByVenueIdQuerySchema = z.object({
    venueId:z.string(), 
    organizationId: z.string(),
    completeName: z.string().optional(),
});

export type ListOwnerByVenueIdQuerySchema = z.infer<typeof listOwnerByVenueIdQuerySchema>;