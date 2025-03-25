import { z } from "zod";

export const createVenueSchema =  z.object({
    userId: z.string(),
    organizationId: z.string(),
    data: z.object({
        cep: z.string(),
        name: z.string(),
        city: z.string(),
        state: z.string(),
        street: z.string(),
        checkIn: z.string().optional(),
        maxGuest: z.string(),
        checkOut: z.string().optional(),
        streetNumber: z.string(),
        neighborhood: z.string(),
        owners: z.array(z.string()),
        hasOvernightStay: z.boolean(),
        complement: z.string().optional(),
        pricePerDay: z.string().optional(),
        pricePerPerson: z.string().optional(),
        pricePerPersonDay: z.string().optional(),
        pricePerPersonHour: z.string().optional(),
        pricingModel: z.enum(["PER_PERSON", "PER_DAY", "PER_PERSON_DAY", "PER_PERSON_HOUR"]),
    }).refine(
        (data) => {
          if (data.hasOvernightStay) {
            return data.checkIn?.trim() && data.checkOut?.trim();
          }
          return true; 
        },
        {
          message: "Se o espaço aceitar pernoite, os campos check-in e check-out são obrigatórios.",
          path: ["checkIn"], // Aponta o erro para o campo `checkIn`
        }
      ),
  })
  

export type CreateVenueRequestParams = z.infer<typeof createVenueSchema>;

