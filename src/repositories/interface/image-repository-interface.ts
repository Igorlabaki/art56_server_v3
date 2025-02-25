import { Image } from "@prisma/client";
import { CreateImageRequestParams } from "../../zod/image/create-image-params-schema";
import { ListImageRequestQuerySchema } from "../../zod/image/list-image-query-schema";
import { UpdateImageRequestParams } from "../../zod/image/upload-image-params-schema";


export interface ImageRepositoryInterface {
  delete: (params: string) => Promise<Image | null>;  
  getById: (params: string) => Promise<Image | null>;
  update: (params: UpdateImageRequestParams) => Promise<Image | null>;
  create: (params: CreateImageRequestParams) => Promise<Image | null>;
  list: (params: ListImageRequestQuerySchema) => Promise<Image[]  | null>;
  verifyImage: (params: {position: number, tag: string, imageId: string | null}) => Promise<Image | null>
}