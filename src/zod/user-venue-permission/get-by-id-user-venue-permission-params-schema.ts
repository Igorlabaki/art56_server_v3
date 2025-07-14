import { z } from "zod";

export const getByIdUserVenuePermissionSchema = z.object({
    userVenuePermissionId: z.string(),
});

export type GetByIdUserVenuePermissionSchema = z.infer<typeof getByIdUserVenuePermissionSchema>;