import { PrismaClient, Document } from "@prisma/client";

import { CreateDocumentRequestParams } from "../../zod/document/create-document-params-schema";
import { ListDocumentRequestQuerySchema } from "../../zod/document/list-document-query-schema";
import { UpdateDocumentRequestParams } from "../../zod/document/update-document-params-schema";
import { CreateDocumentDbSchema } from "../../zod/document/create-document-db-schema";
import { DocumentRepositoryInterface } from "../interface/document-repository-interface";
import { UpdateDocumentDbSchema } from "../../zod/document/update-document-db-schema";

export class PrismaDocumentRepository implements DocumentRepositoryInterface {
  constructor(private readonly prisma: PrismaClient) { }

  async create(params: CreateDocumentDbSchema): Promise<Document | null> {
    const { proposalId, paymentId, ...rest } = params
    return await this.prisma.document.create({
      data: {
        proposal: {
          connect: {
            id: proposalId
          }
        },
        ...(paymentId && {
          payment: {
            connect: {
              id: paymentId
            }
          },
        }),
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
      include: {
        payment: true
      }
    });
  }

  async getDocumentByTitle(reference: string): Promise<Document | null> {
    return await this.prisma.document.findFirst({
      where: {
        title: reference,
      },
    });
  }

  async getByPaymentId(reference: string): Promise<Document | null> {
    return await this.prisma.document.findFirst({
      where: {
        paymentId: reference,
      }
    })
  }

  async update({ data, documentId }: UpdateDocumentDbSchema): Promise<Document | null> {
    return await this.prisma.document.update({
      where: {
        id: documentId,
      },
      data: {
        ...data,
      },
      include: {
        payment: true
      }
    });
  }

  async list({ proposalId, imageUrl }: { proposalId: string, imageUrl?: string }): Promise<Document[]> {
    return await this.prisma.document.findMany({
      where: {
        proposalId,
        ...(imageUrl && { imageUrl }),
      },
      include: {
        payment: true
      }
    });
  }
}
