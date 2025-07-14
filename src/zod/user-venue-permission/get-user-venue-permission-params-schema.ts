import { z } from "zod";

export const getUserVenuePermissionSchema = z.object({
    venueId: z.string().optional(),
    userId: z.string(),
    organizationId: z.string(),
});

export type GetUserVenuePermissionSchema = z.infer<typeof getUserVenuePermissionSchema>;