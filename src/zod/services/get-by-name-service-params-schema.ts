import { z } from "zod";

export const getByNameServiceSchema = z.object({
    name: z.string(),
    venueId: z.string(),
});

export type GetByNameServiceSchema = z.infer<typeof getByNameServiceSchema>;