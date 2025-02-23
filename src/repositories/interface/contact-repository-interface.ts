import { Contact } from "@prisma/client";
import { CreateContactRequestParams } from "../../zod/contact/create-contact-params-schema";
import { ListContactRequestQuerySchema } from "../../zod/contact/list-contact-query-schema";
import { UpdateContactRequestParams } from "../../zod/contact/update-contact-params-schema";

export interface ContactRepositoryInterface {
  delete: (params: string) => Promise<Contact | null>;  
  getById: (params: string) => Promise<Contact | null>
  update: (params: UpdateContactRequestParams) => Promise<Contact | null>;
  create: (params: CreateContactRequestParams) => Promise<Contact | null>;
  list: (params: ListContactRequestQuerySchema) => Promise<Contact[]  | null>;
}