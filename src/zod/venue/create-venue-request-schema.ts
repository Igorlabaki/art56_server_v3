import { z } from "zod";

export const createVenueRequestSchema = z.object({
  userId: z.string(),
  organizationId: z.string(),

  cep: z.string(),
  email: z.string(),
  name: z.string(),
  city: z.string(),
  state: z.string(),
  street: z.string(),
  maxGuest: z.string(),
  streetNumber: z.string(),
  neighborhood: z.string(),
  url: z.string().optional(),
  owners: z.string(),
  hasOvernightStay: z.string(),
  checkIn: z.string().optional(),
  logoUrl: z.string().optional(),
  checkOut: z.string().optional(),
  tiktokUrl: z.string().optional(),
  description: z.string().optional(),
  complement: z.string().optional(),
  pricePerDay: z.string().optional(),
  facebookUrl: z.string().optional(),
  instagramUrl: z.string().optional(),
  minimumPrice: z.string().optional(),
  minimumNights: z.string().optional(),
  whatsappNumber: z.string().optional(),
  pricePerPerson: z.string().optional(),
  pricePerPersonDay: z.string().optional(),
  pricePerPersonHour: z.string().optional(),
  pricingModel: z.enum(["PER_PERSON", "PER_DAY", "PER_PERSON_DAY", "PER_PERSON_HOUR"]),
  openingHour: z.string().optional(),
  closingHour: z.string().optional(),
})

export type CreateVenueRequestParams = z.infer<typeof createVenueRequestSchema>;

