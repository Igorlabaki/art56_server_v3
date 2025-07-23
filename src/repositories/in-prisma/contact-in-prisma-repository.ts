import { PrismaClient, Contact } from "@prisma/client";
import { ContactRepositoryInterface } from "../interface/contact-repository-interface";
import { CreateContactRequestParams } from "../../zod/contact/create-contact-params-schema";
import { ListContactRequestQuerySchema } from "../../zod/contact/list-contact-query-schema";
import { UpdateContactRequestParams } from "../../zod/contact/update-contact-params-schema";

export class PrismaContactRepository implements ContactRepositoryInterface {
  constructor(private readonly prisma: PrismaClient) { }

  async create(params: CreateContactRequestParams): Promise<Contact | null> {
    const {venueId,...rest} = params
    return await this.prisma.contact.create({
      data: {
        venue:{
          connect:{
            id: params.venueId
          }
        },
        ...rest,
      },
    });
  }

  async delete(reference: string): Promise<Contact | null> {
    return await this.prisma.contact.delete({
      where: {
        id: reference,
      },
    });
  }

  async getById(reference: string): Promise<Contact | null> {
    return await this.prisma.contact.findFirst({
      where: {
        id: reference,
      },
    });
  }

  async update({ data, contactId }: UpdateContactRequestParams): Promise<Contact | null> {
    return await this.prisma.contact.update({
      where: {
        id: contactId,
      },
      data: {
        ...data,
      },
    });
  }

  async list({ venueId, name, type }: ListContactRequestQuerySchema): Promise<Contact[]> {
    return await this.prisma.contact.findMany({
      where: {
        ...(name && {
          name: {
            contains: name
          }
        }),
        ...(type && {
          type: type
        }),
        venueId
      },
    });
  }
}
