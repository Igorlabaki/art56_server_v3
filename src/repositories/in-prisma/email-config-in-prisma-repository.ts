import { PrismaClient, EmailConfig } from "@prisma/client";
import { createEmailConfigParamsSchema } from "../../zod/email-config/create-email-config-params-schema";
import { listEmailConfigQuerySchema } from "../../zod/email-config/list-email-config-query-schema";
import { updateEmailConfigParamsSchema } from "../../zod/email-config/update-email-config-params-schema";
import { EmailConfigRepositoryInterface, ValidateEmailConfigTypeParams } from "../interface/email-config-repository-interface";

export class PrismaEmailConfigRepository implements EmailConfigRepositoryInterface {
  constructor(private readonly prisma: PrismaClient) { }

  async create(params: typeof createEmailConfigParamsSchema._type): Promise<EmailConfig | null> {
    return await this.prisma.emailConfig.create({
      data: {
        ...params,
      },
    });
  }

  async delete(reference: string): Promise<EmailConfig | null> {
    return await this.prisma.emailConfig.delete({
      where: {
        id: reference,
      },
    });
  }

  async getById(reference: string): Promise<EmailConfig | null> {
    return await this.prisma.emailConfig.findFirst({
      where: {
        id: reference,
      },
    });
  }

  async update(params: typeof updateEmailConfigParamsSchema._type): Promise<EmailConfig | null> {
    const { emailConfigId, ...data } = params;
    return await this.prisma.emailConfig.update({
      where: {
        id: emailConfigId,
      },
      data: {
        ...data,
      },
    });
  }

  async list({ venueId, type }: typeof listEmailConfigQuerySchema._type): Promise<EmailConfig[]> {
    return await this.prisma.emailConfig.findMany({
      where: {
        ...(type && {
          type
        }),
        venueId
      },
    });
  }
} 