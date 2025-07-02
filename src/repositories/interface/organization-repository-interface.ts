import { Image, Organization, Text, User } from "@prisma/client";
import { CreateOrganizationRequestParams } from "../../zod/organization/create-organization-params-schema";
import { ListOrganizationQuerySchema } from "../../zod/organization/list-organization-params-schema";
import { GetByIdOrganizationSchema } from "../../zod/organization/get-by-id-organization-params-schema";
import { DeleteOrganizationSchema } from "../../zod/organization/delete-organization-params-schema";
import { UpdateImageOrganizationRequestSchema } from "../../zod/organization/update-image-organization-request-schema";
import { GetOrganziationWebDataRequestParamSchema } from "../../zod/organization/get-web-data-param-schema";

export type OrganizationWithVenueCount = Organization & {
  _count: {
    venues: number
  }
}

export interface UpdateOrganizationRequestParams {
  organizationId: string,
  data:{
    name?: string
  }
}
export interface CreateOrganizationParams {
  name: string;
}

export interface OrganizationWebDataResponse  {
  id: string;
  name: string;
  texts: Text[];
  images: Image[];
  email: string | null;
  logoUrl: string | null;
  tiktokUrl: string | null;
  facebookUrl: string | null;
  instagramUrl: string | null;
  whatsappNumber: string | null;
};

export interface OrganizationRepositoryInterface {
  delete: (params: DeleteOrganizationSchema) => Promise<Organization | null>
  list: (params: ListOrganizationQuerySchema) => Promise<OrganizationWithVenueCount[] | null>
  getById: (params: GetByIdOrganizationSchema) => Promise<Organization | null>
  update: (params: UpdateOrganizationRequestParams) => Promise<Organization | null>
  create: (params: CreateOrganizationRequestParams) => Promise<Organization | null>
  updateImages: (params: UpdateImageOrganizationRequestSchema) => Promise<Organization | null>
  getOrganizationWebData: (params: GetOrganziationWebDataRequestParamSchema) => Promise<OrganizationWebDataResponse | null>
}