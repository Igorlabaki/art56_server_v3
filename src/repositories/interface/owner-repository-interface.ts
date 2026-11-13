import { Owner } from "@prisma/client";
import { ListOwnerQuerySchema } from "../../zod/owner/list-owner-params-schema";
import { UpdateOwnerSchema } from "../../zod/owner/update-owner-params-schema";
import { CreateOrganizationOwnerRequestParams } from "../../zod/owner/create-owner-params-schema";
import { ListOwnerByVenueIdQuerySchema } from "../../zod/owner/list-owners-by-venue-params-schema";
import { CreateVenueOwnerRequestParams } from "../../zod/owner/create-venue-owner-params-schema";


/** PJ busca por `cnpj` normalizado; PF busca por `completeName` exato entre os PF. Sempre dentro da organizacao. */
export interface FindOwnerDuplicateParams {
  organizationId: string
  cnpj?: string
  completeName?: string
  excludeOwnerId?: string
}

export interface OwnerRepositoryInterface {
  delete: (params: string) => Promise<Owner | null>
  getById: (params: string) => Promise<Owner | null>
  update: (params: UpdateOwnerSchema) => Promise<Owner | null> 
  findDuplicate: (params: FindOwnerDuplicateParams) => Promise<Owner | null>
  list: (params: ListOwnerQuerySchema) => Promise<Owner[]  | null>
  listByVenue: (params: ListOwnerByVenueIdQuerySchema) => Promise<Owner[]  | null>
  createVenueOwner: (params: CreateVenueOwnerRequestParams) => Promise<Owner | null>
  createOrganizationOwner: (params: CreateOrganizationOwnerRequestParams) => Promise<Owner | null>
}