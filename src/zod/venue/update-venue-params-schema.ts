import { z } from "zod";

export const updateVenueSchema = z.object({
    venueId: z.string(),
    userId: z.string(),
    data: z.object({
        cep: z.string().optional(),
        email: z.string().optional(),
        name: z.string().optional(),
        url: z.string().optional(),
        city: z.string().optional(),
        state: z.string().optional(),
        street: z.string().optional(),
        maxGuest: z.string().optional(),
        complement: z.string().optional(),
        streetNumber: z.string().optional(),
        neighborhood: z.string().optional(),
        pricePerDay: z.string().optional(),
        facebookUrl: z.string().optional(),
        tiktokUrl: z.string().optional(),
        instagramUrl: z.string().optional(),
        pricePerPerson: z.string().optional(),
        pricePerPersonDay: z.string().optional(),
        pricePerPersonHour: z.string().optional(),
        owners: z.array(z.string()).optional(),
        hasOvernightStay: z.boolean().optional(),
        pricingModel: z.enum(["PER_PERSON", "PER_DAY", "PER_PERSON_DAY", "PER_PERSON_HOUR"]),
    }),
});

export type UpdateVenueSchema = z.infer<typeof updateVenueSchema>;