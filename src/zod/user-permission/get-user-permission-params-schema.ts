import { z } from "zod";

export const getUserPermissionSchema = z.object({
    venueId: z.string(),
    userId: z.string(),
    organizationId: z.string(),
});

export type GetUserPermissionSchema = z.infer<typeof getUserPermissionSchema>;