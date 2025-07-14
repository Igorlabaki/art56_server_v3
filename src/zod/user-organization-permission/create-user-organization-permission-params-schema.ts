import { z } from "zod";

export const createUserOrganizationPermissionSchema = z.object({
    organizationId: z.string(), // ID da organização (obrigatório)
    userOrganizationId: z.string().optional(), // ID da relação UserOrganization (opcional)
    userId: z.string(),
    permissions: z.array(
        z.string()
    ),
});

export type CreateUserOrganizationPermissionRequestParams = z.infer<typeof createUserOrganizationPermissionSchema>;













