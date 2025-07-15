import { z } from "zod";

export const updateUserOrganizationSchema = z.object({
    userOrganizationId: z.string(),
    venuesPermissions: z.array(
        z.object({
            venueId: z.string(),
            permissions: z.array(
                z.string()
            ),
        })
    ),
});

export type UpdateUserOrganizationRequestParams = z.infer<typeof updateUserOrganizationSchema>;













