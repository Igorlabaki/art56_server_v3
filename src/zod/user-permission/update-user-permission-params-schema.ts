import { z } from "zod";

export const updateUserPermissionSchema = z.object({
    userPermissionId: z.string(),
    role: z.string(),
    venueId: z.string(),
    permissions: z.array(
        z.string()
    ),
});

export type UpdateUserPermissionRequestParams = z.infer<typeof updateUserPermissionSchema>;













