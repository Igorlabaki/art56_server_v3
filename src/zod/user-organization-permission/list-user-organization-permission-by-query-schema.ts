import { z } from "zod";

export const listUserOrganizationPermissionByUserRequestQuerySchema = z.object({
    userOrganizationId: z.string(),
    role: z.string().optional(),
})

export type ListUserOrganizationPermissionByUserRequestQuerySchema = z.infer<typeof listUserOrganizationPermissionByUserRequestQuerySchema>;

