import { z } from "zod";

export const deleteUserVenuePermissionRequestParamSchema = z.object({
    userVenuePermissionId: z.string(),
})

export type DeleteUserVenuePermissionRequestParamSchema = z.infer<typeof deleteUserVenuePermissionRequestParamSchema>;

