import { z } from "zod";
import { userorganizationRoutes } from "../../router/userOrganization";

export const createUserVenuePermissionSchema = z.object({
    venueId: z.string(),
    userorganizationId: z.string().optional(),
    organizationId: z.string(),
    userId: z.string(),
    role: z.string().optional(),
    permissions: z.array(
        z.string()
    ),
});

export type CreateUserVenuePermissionRequestParams = z.infer<typeof createUserVenuePermissionSchema>;













