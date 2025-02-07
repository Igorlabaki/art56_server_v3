import { z } from "zod";

export const listServiceRequestQuerySchema = z.object({
    venueId:z.string(),
    name: z.string().optional(),
})

export type ListServiceRequestQuerySchema = z.infer<typeof listServiceRequestQuerySchema>;

