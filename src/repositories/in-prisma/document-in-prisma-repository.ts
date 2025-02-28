import { PrismaClient, Document } from "@prisma/client";
import { DocumentRepositoryInterface } from "../interface/document-repository-interface";
import { CreateDocumentRequestParams } from "../../zod/document/create-document-params-schema";
import { ListDocumentRequestQuerySchema } from "../../zod/document/list-document-query-schema";
import { UpdateDocumentRequestParams } from "../../zod/document/update-document-params-schema";
import { CreateDocumentDbSchema } from "../../zod/document/create-document-db-schema";

export class PrismaDocumentRepository implements DocumentRepositoryInterface {
  constructor(private readonly prisma: PrismaClient) { }

  async create(params: CreateDocumentDbSchema): Promise<Document | null> {
    const {proposalId,...rest}  = params
    return await this.prisma.document.create({
      data: {
        proposal:{
          connect:{
            id: proposalId
          }
        },
        ...rest,
      },
    });
  }

  async delete(reference: string): Promise<Document | null> {
    return await this.prisma.document.delete({
      where: {
        id: reference,
      },
    });
  }

  async getById(reference: string): Promise<Document | null> {
    return await this.prisma.document.findFirst({
      where: {
        id: reference,
      },
    });
  }

  async getDocumentByTitle(reference: string): Promise<Document | null> {
    return await this.prisma.document.findFirst({
      where: {
        title: reference,
      },
    });
  }

  async update({ data, documentId }: UpdateDocumentRequestParams): Promise<Document | null> {
    return await this.prisma.document.update({
      where: {
        id: documentId,
      },
      data: {
        ...data,
      },
    });
  }

  async list({ proposalId, document }: ListDocumentRequestQuerySchema): Promise<Document[]> {
    return await this.prisma.document.findMany({
      where: {
        ...(document && {
          document: {
            contains: document
          }
        }),
        proposalId
      },
    });
  }
}
