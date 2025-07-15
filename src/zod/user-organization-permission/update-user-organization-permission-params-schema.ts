import { z } from "zod";

export const updateUserOrganizationPermissionSchema = z.object({
    userOrganizationPermissionId: z.string(),
    permissions: z.array(
        z.string()
    ),
    role: z.string().optional(),
});

export type UpdateUserOrganizationPermissionRequestParams = z.infer<typeof updateUserOrganizationPermissionSchema>;













