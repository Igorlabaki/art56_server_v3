import { Venue, User } from "@prisma/client";
import { UpdateVenueSchema } from "../../zod/venue/update-venue-params-schema";
import { CreateVenueRequestParams } from "../../zod/venue/create-venue-params-schema";
import { GetVenueByIdRequestParamSchema } from "../../zod/venue/get-by-id-venue-param-schema";
import { ListVenueRequestQuerySchema } from "../../zod/venue/list-venue-query-schema";
import { ListPermittedVenueRequestQuerySchema } from "../../zod/venue/list-venue-permitted-query-schema";
import { GetSelectedVenueRequestParamSchema } from "../../zod/venue/get-selected-venue-param-schema";
export interface ItemListVenueResponse {
  id: string;
  name: string;
  images: { imageUrl: string; }[]
} 

export interface VenueRepositoryInterface {
  delete: (params: string) => Promise<Venue | null>
  update: (params: UpdateVenueSchema) => Promise<Venue | null>
  create: (params: CreateVenueRequestParams) => Promise<Venue | null>
  getById: (params: GetVenueByIdRequestParamSchema) => Promise<Venue | null>
  getSelectedVenue: (params: GetSelectedVenueRequestParamSchema) => Promise<Venue | null>
  list: (query: ListVenueRequestQuerySchema) => Promise<ItemListVenueResponse[]  | null>
  listPermitted: (query: ListPermittedVenueRequestQuerySchema) => Promise<ItemListVenueResponse[]  | null>
}