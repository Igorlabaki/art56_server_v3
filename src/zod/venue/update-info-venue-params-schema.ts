import { z } from "zod";

export const updateVenueInfoSchemaDb = z.object({
    userId: z.string(),
    venueId: z.string(),
    name: z.string(),
    tiktokUrl: z.string().optional(),
    instagramUrl: z.string().optional(),
    facebookUrl: z.string().optional(),
    url: z.string().optional(),
    description: z.string().optional(),
    state: z.string(),
    city: z.string(),
    isShowOnOrganization: z.boolean(),
});

export type UpdateVenueInfoSchemaDb = z.infer<typeof updateVenueInfoSchemaDb>;