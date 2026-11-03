import { GoogleCalendarIntegration } from "@prisma/client";

export interface CreateGoogleCalendarIntegrationParams {
  userId: string;
  organizationId: string;
  accessTokenEncrypted: string;
  refreshTokenEncrypted: string;
  scope: string;
  tokenExpiresAt: Date;
  googleCalendarId?: string;
}

export interface UpdateGoogleCalendarIntegrationParams {
  id: string;
  accessTokenEncrypted?: string;
  refreshTokenEncrypted?: string;
  scope?: string;
  tokenExpiresAt?: Date;
  googleCalendarId?: string;
}

export interface GoogleCalendarIntegrationRepositoryInterface {
  create(params: CreateGoogleCalendarIntegrationParams): Promise<GoogleCalendarIntegration | null>;
  findByUserAndOrganization(userId: string, organizationId: string): Promise<GoogleCalendarIntegration | null>;
  update(params: UpdateGoogleCalendarIntegrationParams): Promise<GoogleCalendarIntegration | null>;
  delete(id: string): Promise<GoogleCalendarIntegration | null>;
}
