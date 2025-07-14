import { z } from "zod";

export const updateUserVenuePermissionSchema = z.object({
    userVenuePermissionId: z.string(),
    role: z.string(),
    venueId: z.string(),
    permissions: z.array(
        z.string()
    ),
});

export type UpdateUserVenuePermissionRequestParams = z.infer<typeof updateUserVenuePermissionSchema>;













