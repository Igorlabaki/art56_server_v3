import { z } from "zod";

export const getUserOrganizationPermissionSchema = z.object({
    organizationId: z.string(),
    userId: z.string(),
});

export type GetUserOrganizationPermissionSchema = z.infer<typeof getUserOrganizationPermissionSchema>;