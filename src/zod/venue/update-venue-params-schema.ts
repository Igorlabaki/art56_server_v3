import { z } from "zod";

export const updateVenueSchema = z.object({
    venueId: z.string(),
    data: z.object({
        cep: z.string().optional(),
        name: z.string().optional(),
        city: z.string().optional(),
        state: z.string().optional(),
        street: z.string().optional(),
        maxGuest: z.string().optional(),
        complement: z.string().optional(),
        pricePerDay: z.string().optional(),
        streetNumber: z.string().optional(),
        neighborhood: z.string().optional(),
        pricePerPerson: z.string().optional(),
        owners: z.array(z.string()).optional(),
        hasOvernightStay: z.boolean().optional(),
        pricingModel: z.enum(["PER_PERSON", "PER_DAY"]).optional(),
    }),
});

export type UpdateVenueSchema = z.infer<typeof updateVenueSchema>;