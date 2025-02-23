import { Image } from "@prisma/client";
import { CreateImageRequestParams } from "../../zod/image/create-image-params-schema";
import { ListImageRequestQuerySchema } from "../../zod/image/list-image-query-schema";


export interface ImageRepositoryInterface {
  delete: (params: string) => Promise<Image | null>;  
  getById: (params: string) => Promise<Image | null>;
  create: (params: CreateImageRequestParams) => Promise<Image | null>;
  verifyImage: (params: {position: number, tag: string}) => Promise<Image | null>
/*   update: (params: UpdateImageRequestParams) => Promise<Image | null>;*/
  list: (params: ListImageRequestQuerySchema) => Promise<Image[]  | null>;
}