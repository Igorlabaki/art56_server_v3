import { PrismaClient, GoogleCalendarIntegration } from "@prisma/client";
import {
  GoogleCalendarIntegrationRepositoryInterface,
  CreateGoogleCalendarIntegrationParams,
  UpdateGoogleCalendarIntegrationParams,
} from "../interface/google-calendar-integration-repository-interface";

export class PrismaGoogleCalendarIntegrationRepository
  implements GoogleCalendarIntegrationRepositoryInterface
{
  constructor(private readonly prisma: PrismaClient) {}

  async create(
    params: CreateGoogleCalendarIntegrationParams
  ): Promise<GoogleCalendarIntegration | null> {
    const integration = await this.prisma.googleCalendarIntegration.upsert({
      where: {
        userId_organizationId: {
          userId: params.userId,
          organizationId: params.organizationId,
        },
      },
      create: {
        userId: params.userId,
        organizationId: params.organizationId,
        accessTokenEncrypted: params.accessTokenEncrypted,
        refreshTokenEncrypted: params.refreshTokenEncrypted,
        scope: params.scope,
        tokenExpiresAt: params.tokenExpiresAt,
        googleCalendarId: params.googleCalendarId ?? null,
      },
      update: {
        accessTokenEncrypted: params.accessTokenEncrypted,
        refreshTokenEncrypted: params.refreshTokenEncrypted,
        scope: params.scope,
        tokenExpiresAt: params.tokenExpiresAt,
        googleCalendarId: params.googleCalendarId ?? undefined,
      },
    });
    return integration;
  }

  async findByUserAndOrganization(
    userId: string,
    organizationId: string
  ): Promise<GoogleCalendarIntegration | null> {
    return this.prisma.googleCalendarIntegration.findUnique({
      where: {
        userId_organizationId: {
          userId,
          organizationId,
        },
      },
    });
  }

  async update(
    params: UpdateGoogleCalendarIntegrationParams
  ): Promise<GoogleCalendarIntegration | null> {
    return this.prisma.googleCalendarIntegration.update({
      where: { id: params.id },
      data: {
        ...(params.accessTokenEncrypted != null && {
          accessTokenEncrypted: params.accessTokenEncrypted,
        }),
        ...(params.refreshTokenEncrypted != null && {
          refreshTokenEncrypted: params.refreshTokenEncrypted,
        }),
        ...(params.scope != null && { scope: params.scope }),
        ...(params.tokenExpiresAt != null && {
          tokenExpiresAt: params.tokenExpiresAt,
        }),
        ...(params.googleCalendarId !== undefined && {
          googleCalendarId: params.googleCalendarId,
        }),
      },
    });
  }

  async delete(id: string): Promise<GoogleCalendarIntegration | null> {
    return this.prisma.googleCalendarIntegration.delete({
      where: { id },
    });
  }
}
