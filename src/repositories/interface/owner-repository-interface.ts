import { Owner } from "@prisma/client";
import { ListOwnerQuerySchema } from "../../zod/owner/list-owner-params-schema";
import { UpdateOwnerSchema } from "../../zod/owner/update-owner-params-schema";
import { CreateOrganizationOwnerRequestParams } from "../../zod/owner/create-owner-params-schema";
import { ListOwnerByVenueIdQuerySchema } from "../../zod/owner/list-owners-by-venue-params-schema";
import { CreateVenueOwnerRequestParams } from "../../zod/owner/create-venue-owner-params-schema";


export interface OwnerRepositoryInterface {
  delete: (params: string) => Promise<Owner | null>
  getById: (params: string) => Promise<Owner | null>
  update: (params: UpdateOwnerSchema) => Promise<Owner | null> 
  vefiryIfOwnerExists: (params: string) => Promise<Owner | null>
  list: (params: ListOwnerQuerySchema) => Promise<Owner[]  | null>
  listByVenue: (params: ListOwnerByVenueIdQuerySchema) => Promise<Owner[]  | null>
  createVenueOwner: (params: CreateVenueOwnerRequestParams) => Promise<Owner | null>
  createOrganizationOwner: (params: CreateOrganizationOwnerRequestParams) => Promise<Owner | null>
}