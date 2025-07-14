import { z } from "zod";

export const updateUserOrganizationPermissionSchema = z.object({
    userOrganizationPermissionId: z.string(),
    permissions: z.array(
        z.string()
    ),
});

export type UpdateUserOrganizationPermissionRequestParams = z.infer<typeof updateUserOrganizationPermissionSchema>;













