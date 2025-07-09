import { z } from "zod";

export const createServiceSchema = z.object({
    name: z.string(),
    price: z.number(),      
    venueId: z.string(),
    rpaRequired: z.boolean().optional().default(false)  ,
    rpaMinPeople: z.number().optional().default(1),
});

export type CreateServiceRequestParams = z.infer<typeof createServiceSchema>;
