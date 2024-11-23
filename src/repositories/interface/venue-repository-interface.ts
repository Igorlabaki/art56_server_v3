import { Venue, User } from "@prisma/client";
import { CreateVenueRequestParams } from "../../zod/venue/create-venue-params-schema";


export interface VenueRepositoryInterface {
  list: (params: string) => Promise<Venue[]  | null>
  delete: (params: string) => Promise<Venue | null>
  getById: (params: string) => Promise<Venue | null>
  /* update: (params: UpdateVenueRequestParams) => Promise<Venue | null> */
  create: (params: CreateVenueRequestParams) => Promise<Venue | null>
}