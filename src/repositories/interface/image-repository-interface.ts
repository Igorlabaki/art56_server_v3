import { Image, Venue } from "@prisma/client";
import { CreateImageRequestParams } from "../../zod/image/create-image-params-schema";
import { ListImageRequestQuerySchema } from "../../zod/image/list-image-query-schema";
import { UpdateImageRequestParams } from "../../zod/image/upload-image-params-schema";
import { GetByTagImageRequestQuerySchema } from "../../zod/image/get-by-tag-image-query-schema";
import { CreateImageDbParams } from "../../zod/image/create-image-params-db-schema";
import { CreateImageOrganizationDbParams } from "../../zod/image-organization/create-image-organization-params-db-schema";
import { ListImageOrganizationRequestQuerySchema } from "../../zod/image-organization/list-image-organization-query-schema";
import { UpdateImageOrganizationRequestParams } from "../../zod/image-organization/upload-image-organization-params-schema";
import { GetByTagImageOrganizationRequestQuerySchema } from "../../zod/image-organization/get-by-tag-image-organization-query-schema";


export interface ImageRepositoryInterface {
  delete: (params: string) => Promise<Image | null>;  
  getById: (params: string) => Promise<Image | null>;
  update: (params: UpdateImageRequestParams) => Promise<Image | null>;
  updateOrganization: (params: UpdateImageOrganizationRequestParams) => Promise<Image | null>;
  create: (params: CreateImageDbParams) => Promise<Image | null>;
  createOrganization: (params: CreateImageOrganizationDbParams) => Promise<Image | null>;
  list: (params: ListImageRequestQuerySchema) => Promise<Image[]  | null>;
  listOrganization: (params: ListImageOrganizationRequestQuerySchema) => Promise<Image[] | null>;
  getByTag: (params: GetByTagImageRequestQuerySchema) => Promise<Image[] | null>;
  getByTagOrganization: (params: GetByTagImageOrganizationRequestQuerySchema) => Promise<Image[] | null>;
  verifyImage: (params: {position: number, tag: string, imageId: string | null, venueId: string}) => Promise<Image | null>
  verifyImageOrganization: (params: {position: number, tag: string, imageId: string | null, organizationId: string}) => Promise<Image | null>
}