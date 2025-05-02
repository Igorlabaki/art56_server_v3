import { z } from "zod";

export const listUserPermissionByUserRequestQuerySchema = z.object({
    userOrganizationId: z.string(),
    venueId: z.string().optional(),
    role: z.string().optional(),
})

export type ListUserPermissionByUserRequestQuerySchema = z.infer<typeof listUserPermissionByUserRequestQuerySchema>;

