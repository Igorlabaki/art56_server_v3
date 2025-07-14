import { z } from "zod";

export const getByIdUserOrganizationPermissionSchema = z.object({
    userOrganizationPermissionId: z.string(),
});

export type GetByIdUserOrganizationPermissionSchema = z.infer<typeof getByIdUserOrganizationPermissionSchema>;