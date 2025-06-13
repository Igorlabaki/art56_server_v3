import { Image, Venue } from "@prisma/client";
import { CreateImageRequestParams } from "../../zod/image/create-image-params-schema";
import { ListImageRequestQuerySchema } from "../../zod/image/list-image-query-schema";
import { UpdateImageRequestParams } from "../../zod/image/upload-image-params-schema";
import { GetByTagImageRequestQuerySchema } from "../../zod/image/get-by-tag-image-query-schema";
import { CreateImageDbParams } from "../../zod/image/create-image-params-db-schema";


export interface ImageRepositoryInterface {
  delete: (params: string) => Promise<Image | null>;  
  getById: (params: string) => Promise<Image | null>;
  update: (params: UpdateImageRequestParams) => Promise<Image | null>;
  create: (params: CreateImageDbParams) => Promise<Image | null>;
  list: (params: ListImageRequestQuerySchema) => Promise<Image[]  | null>;
  getByTag: (params: GetByTagImageRequestQuerySchema) => Promise<Image[] | null>;
  verifyImage: (params: {position: number, tag: string, imageId: string | null, venueId: string}) => Promise<Image | null>
}