import { Venue, User } from "@prisma/client";
import { CreateVenueRequestParams } from "../../zod/venue/create-venue-params-schema";
import { ListVenueRequestQuerySchema } from "../../zod/venue/list-venue-query-schema";
import { GetVenueByIdRequestParamSchema } from "../../zod/venue/get-by-id-venue-param-schema";
import { UpdateVenueSchema } from "../../zod/venue/update-venue-params-schema";


export interface ItemListVenueResponse {
  id: string;
  name: string;
  images: { imageUrl: string; }[]
} 

export interface VenueRepositoryInterface {
  delete: (params: string) => Promise<Venue | null>
  getById: (params: GetVenueByIdRequestParamSchema) => Promise<Venue | null>
  update: (params: UpdateVenueSchema) => Promise<Venue | null>
  create: (params: CreateVenueRequestParams) => Promise<Venue | null>
  list: (query: ListVenueRequestQuerySchema) => Promise<ItemListVenueResponse[]  | null>
}