import { z } from "zod";

export const updateVenuePaymentInfoSchemaDb = z.object({
    venueId: z.string(),
    userId: z.string(),
    data: z.object({
        pricePerDay: z.string().optional(),
        pricePerPerson: z.string().optional(),
        pricePerPersonDay: z.string().optional(),
        pricePerPersonHour: z.string().optional(),
        pricingModel: z.enum(["PER_PERSON", "PER_DAY", "PER_PERSON_DAY", "PER_PERSON_HOUR"]),
    }),
});

export type UpdateVenuePaymentInfoSchemaDb = z.infer<typeof updateVenuePaymentInfoSchemaDb>;