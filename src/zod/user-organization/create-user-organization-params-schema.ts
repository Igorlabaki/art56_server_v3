import { z } from "zod";

export const createUserOrganizationSchema = z.object({
    userId: z.string(),
    organizationId: z.string(),
    role: z.enum(["ADMIN", "USER"]),
    venuesPermissions: z.array(
        z.object({
            venueId: z.string(),
            permissions: z.array(
                z.enum([
                    "VIEW_INFO",
                    "EDIT_INFO",
                    "EDIT_VENUE",
                    "EDIT_IMAGE",
                    "EDIT_EVENT",
                    "VIEW_EVENTS",
                    "VIEW_IMAGES",
                    "VIEW_CALENDAR",
                    "VIEW_ANALYSIS",
                    "EDIT_PROPOSAL",
                    "EDIT_CALENDAR",
                    "VIEW_PROPOSALS",
                    "EDIT_ORGANIZATION",
                    "VIEW_NOTIFICATIONS",
                ])
            ),
        })
    ),
});

export type CreateUserOrganizationRequestParams = z.infer<typeof createUserOrganizationSchema>;













