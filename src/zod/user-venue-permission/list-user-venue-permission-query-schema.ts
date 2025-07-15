import { z } from "zod";

export const listUserVenuePermissionRequestQuerySchema = z.object({
    userId:z.string(),
    name: z.string().optional(),
    role: z.string().optional(),
})

    export type ListUserVenuePermissionRequestQuerySchema = z.infer<typeof listUserVenuePermissionRequestQuerySchema>;

