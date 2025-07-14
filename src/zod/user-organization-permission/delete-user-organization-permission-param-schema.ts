import { z } from "zod";

export const deleteUserOrganizationPermissionRequestParamSchema = z.object({
    userOrganizationPermissionId: z.string(),
})

export type DeleteUserOrganizationPermissionRequestParamSchema = z.infer<typeof deleteUserOrganizationPermissionRequestParamSchema>;

