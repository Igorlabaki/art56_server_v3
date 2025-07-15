import { z } from "zod";

export const listUserOrganizationPermissionRequestQuerySchema = z.object({
    userId:z.string(),
    name: z.string().optional(),
    role: z.string().optional(),
})

export type ListUserOrganizationPermissionRequestQuerySchema = z.infer<typeof listUserOrganizationPermissionRequestQuerySchema>;

