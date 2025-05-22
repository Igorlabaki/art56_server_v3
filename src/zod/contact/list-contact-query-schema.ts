import { z } from "zod";

enum ContactType {
    TEAM_MEMBER = "TEAM_MEMBER",
    SUPPLIER = "SUPPLIER"
}

export const listContactRequestQuerySchema = z.object({
    venueId: z.string(),
    name: z.string().optional(),
    type: z.nativeEnum(ContactType).optional()
})

export type ListContactRequestQuerySchema = z.infer<typeof listContactRequestQuerySchema>;

