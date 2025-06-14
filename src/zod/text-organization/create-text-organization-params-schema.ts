import { z } from "zod";

export const createTextOrganizationSchema = z.object({
    area: z.string(),
    text: z.string(),
    organizationId: z.string(),
    position: z.number(),
    title: z.string().optional(),
});

export type CreateTextOrganizationSchema = z.infer<typeof createTextOrganizationSchema>;