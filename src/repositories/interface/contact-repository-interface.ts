import { Contact, ContactType, PartnerCategory } from "@prisma/client";
import { CreateContactRequestParams } from "../../zod/contact/create-contact-params-schema";
import { UpdateContactRequestParams } from "../../zod/contact/update-contact-params-schema";

export interface ContactListDbQuery {
  venueId: string;
  name?: string;
  type?: ContactType;
  q?: string;
  category?: PartnerCategory;
  skip?: number;
  take?: number;
}

export interface ContactListSummary {
  total: number;
  withLogo: number;
  withDescription: number;
}

export interface ContactRepositoryInterface {
  delete: (params: string) => Promise<Contact | null>;  
  getById: (params: string) => Promise<Contact | null>
  update: (params: UpdateContactRequestParams) => Promise<Contact | null>;
  create: (params: CreateContactRequestParams) => Promise<Contact | null>;
  list: (params: ContactListDbQuery) => Promise<{ items: Contact[]; total: number }>;
  summarize: (params: ContactListDbQuery) => Promise<ContactListSummary>;
}