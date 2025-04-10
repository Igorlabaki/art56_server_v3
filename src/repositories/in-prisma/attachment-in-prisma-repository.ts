import { PrismaClient, Attachment } from "@prisma/client";
import { AttachmentRepositoryInterface } from "../interface/attachment-repository-interface";
import { CreateAttachemntDbSchema } from "../../zod/attachment/create-attachment-params-schema";
import { ListAttachmentRequestQuerySchema } from "../../zod/attachment/list-attachment-query-schema";
import { UpdateAttachmentRequestParams } from "../../zod/attachment/update-attachment-params-schema";

export class PrismaAttachmentRepository implements AttachmentRepositoryInterface {
  constructor(private readonly prisma: PrismaClient) { }

  async verifyIfExists(params: { venueId: string; title: string; }): Promise<Attachment | null> {
    return await this.prisma.attachment.findFirst({
      where: {
        title: params.title,
        NOT: [
          { venueId: params.venueId },
        ]
      },
    });
  }

  async create(params: CreateAttachemntDbSchema): Promise<Attachment | null> {
    return await this.prisma.attachment.create({
      data: {
        ...params,
      },
      include:{
        venue:{
          select:{
            name: true
          }
        }
      }
    });
  }

  async delete(reference: string): Promise<Attachment | null> {
    return await this.prisma.attachment.delete({
      where: {
        id: reference,
      },
    });
  }

  async getById(reference: string): Promise<Attachment | null> {
    return await this.prisma.attachment.findFirst({
      where: {
        id: reference,
      },
    });
  }

  async getByAttachment({ attachmentId }: { attachmentId: string }): Promise<Attachment | null> {
    return await this.prisma.attachment.findFirst({
      where: {
        id: attachmentId
      },
    });
  }

  async update({ data, attachmentId }: UpdateAttachmentRequestParams): Promise<Attachment | null> {
    return await this.prisma.attachment.update({
      where: {
        id: attachmentId,
      },
      data: {
        ...data,
      },
      include:{
        venue:{
          select:{
            name: true
          }
        }
      }
    });
  }

  async list({ organizationId, name }: ListAttachmentRequestQuerySchema): Promise<Attachment[]> {
    return await this.prisma.attachment.findMany({
      where: {
        ...(name && {
          venue: {
            name: {
              contains: name
            }
          }
        }),
        organizationId
      },
      include:{
        venue:{
          select:{
            name: true
          }
        }
      }
    });
  }
}
