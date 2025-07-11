import { z } from "zod";

export const getUserPermissionSchema = z.object({
    venueId: z.string(),
    userOrganizationId: z.string(),
});

export type GetUserPermissionSchema = z.infer<typeof getUserPermissionSchema>;