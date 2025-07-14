import { z } from "zod";

export const listUserOrganizationPermissionByUserRequestQuerySchema = z.object({
    userOrganizationId: z.string(),
})

export type ListUserOrganizationPermissionByUserRequestQuerySchema = z.infer<typeof listUserOrganizationPermissionByUserRequestQuerySchema>;

