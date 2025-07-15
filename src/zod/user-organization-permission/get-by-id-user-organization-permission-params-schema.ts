import { z } from "zod";

export const getByIdUserOrganizationPermissionSchema = z.object({
    organizationId: z.string(),
    userId: z.string(),
});

export type GetByIdUserOrganizationPermissionSchema = z.infer<typeof getByIdUserOrganizationPermissionSchema>;