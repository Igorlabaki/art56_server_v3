import { z } from "zod";
import { userorganizationRoutes } from "../../router/userOrganization";

export const createUserPermissionSchema = z.object({
    role: z.string(),
    venueId: z.string(),
    userorganizationId: z.string().optional(),
    organizationId: z.string(),
    userId: z.string(),
    permissions: z.array(
        z.string()
    ),
});

export type CreateUserPermissionRequestParams = z.infer<typeof createUserPermissionSchema>;













