import { z } from "zod";

export const createServiceSchema = z.object({
    name: z.string(),
    price: z.number(),
    venueId: z.string(),
});

export type CreateServiceRequestParams = z.infer<typeof createServiceSchema>;
