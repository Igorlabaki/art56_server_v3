import { z } from "zod";
import { tourVideoUrlSchema } from "./tour-video-url-schema";

export const proposalColorSchema = z
    .union([
        z.literal("").transform(() => null),
        z.string().regex(/^#[0-9A-Fa-f]{6}$/),
        z.null(),
    ])
    .optional();

export const updateVenueSchemaRequest = z.object({
    venueId: z.string(),
    userId: z.string(),
    description:z.string().optional(),
    cep: z.string().optional(),
    email: z.string().optional(),
    name: z.string().optional(),
    url: z.string().optional(),
    city: z.string().optional(),
    cnpj: z.string().optional(),
    state: z.string().optional(),
    whatsappNumber: z.string().optional(),
    minimumPrice: z.string().optional(),
    street: z.string().optional(),
    minimumNights: z.string().optional(),
    checkIn: z.string().optional(),
    checkOut: z.string().optional(),
    maxGuest: z.string().optional(),
    complement: z.string().optional(),
    streetNumber: z.string().optional(),
    neighborhood: z.string().optional(),
    pricePerDay: z.string().optional(),
    facebookUrl: z.string().optional(),
    tiktokUrl: z.string().optional(),
    instagramUrl: z.string().optional(),
    tourVideoUrl: tourVideoUrlSchema,
    logoUrl: z.string().optional(),
    proposalPrimaryColor: proposalColorSchema,
    proposalSecondaryColor: proposalColorSchema,
    proposalTextColor: proposalColorSchema,
    pricePerPerson: z.string().optional(),
    pricePerPersonDay: z.string().optional(),
    pricePerPersonHour: z.string().optional(),
    owners: z.string().optional(),
    openingHour: z.string().optional(),
    standardEventDuration: z.string().optional(),
    closingHour: z.string().optional(),
    isShowOnOrganization: z.string().optional(),
    hasOvernightStay: z.string().optional(),
    pricingModel: z.enum(["PER_PERSON", "PER_DAY", "PER_PERSON_DAY", "PER_PERSON_HOUR"]),
});

export type UpdateVenueSchemaRequest = z.infer<typeof updateVenueSchemaRequest>;