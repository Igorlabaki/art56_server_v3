import { z } from "zod";

export const listUserVenuePermissionByUserRequestQuerySchema = z.object({
    userOrganizationId: z.string(),
    venueId: z.string().optional(),
    role: z.string().optional(),
})

export type ListUserVenuePermissionByUserRequestQuerySchema = z.infer<typeof listUserVenuePermissionByUserRequestQuerySchema>;

