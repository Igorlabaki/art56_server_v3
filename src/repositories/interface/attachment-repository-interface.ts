import { Attachment } from "@prisma/client";
import { UpdateAttachmentRequestParams } from "../../zod/attachment/update-attachment-params-schema";
import { ListAttachmentRequestQuerySchema } from "../../zod/attachment/list-attachment-query-schema";
import { CreateAttachemntDbSchema } from "../../zod/attachment/create-attachment-params-schema";


export interface AttachmentRepositoryInterface {
  delete: (params: string) => Promise<Attachment | null>;  
  getById: (params: string) => Promise<Attachment | null>;
  verifyIfExists: (params: {venueId: string, title: string}) => Promise<Attachment | null>;
  create: (params: CreateAttachemntDbSchema) => Promise<Attachment | null>;
  update: (params: UpdateAttachmentRequestParams) => Promise<Attachment | null>;
  list: (params: ListAttachmentRequestQuerySchema) => Promise<Attachment[]  | null>;
}