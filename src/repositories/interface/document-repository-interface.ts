import { Document } from "@prisma/client";
import { CreateDocumentRequestParams } from "../../zod/document/create-document-params-schema";
import { ListDocumentRequestQuerySchema } from "../../zod/document/list-document-query-schema";
import { UpdateDocumentRequestParams } from "../../zod/document/update-document-params-schema";
import { CreateDocumentDbSchema } from "../../zod/document/create-document-db-schema";
import { UpdateDocumentDbSchema } from "../../zod/document/update-document-db-schema";

export interface DocumentRepositoryInterface {
  delete: (params: string) => Promise<Document | null>;  
  getById: (params: string) => Promise<Document | null>;  
  getByPaymentId: (params: string) => Promise<Document | null>;
  getDocumentByTitle: (params: string) => Promise<Document | null>
  create: (params: CreateDocumentDbSchema) => Promise<Document | null>;
  update: (params: UpdateDocumentDbSchema) => Promise<Document | null>;
  list: (params: ListDocumentRequestQuerySchema) => Promise<Document[]  | null>;
}