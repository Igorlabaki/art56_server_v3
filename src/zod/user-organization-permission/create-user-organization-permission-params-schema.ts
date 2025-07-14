import { z } from "zod";

export const createUserOrganizationPermissionSchema = z.object({
    userOrganizationId: z.string(),
    userId: z.string(),
    permissions: z.array(
        z.string()
    ),
});

export type CreateUserOrganizationPermissionRequestParams = z.infer<typeof createUserOrganizationPermissionSchema>;













