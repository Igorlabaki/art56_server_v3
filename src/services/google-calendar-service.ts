import { google, calendar_v3 } from "googleapis";
import { GoogleCalendarIntegration } from "@prisma/client";
import { EncryptionService } from "./encryption-service";
import {
  GoogleCalendarIntegrationRepositoryInterface,
  UpdateGoogleCalendarIntegrationParams,
} from "../repositories/interface/google-calendar-integration-repository-interface";

const TIMEZONE = "America/Sao_Paulo";
const CALENDAR_SCOPES = [
  "https://www.googleapis.com/auth/calendar",
  "https://www.googleapis.com/auth/calendar.events",
];

export type HasCalendarAccessResult =
  | { ok: true }
  | { ok: false; reason: "insufficientPermissions" }
  | { ok: false; reason: "tokenExpired" };

export interface CreateEventPayload {
  summary: string;
  description?: string;
  start: { dateTime: string; timeZone?: string };
  end: { dateTime: string; timeZone?: string };
}

/** Usa o tipo do cliente OAuth2 do próprio googleapis para evitar conflito entre versões de google-auth-library. */
type GoogleAuthClient = InstanceType<typeof google.auth.OAuth2>;

function createOAuth2Client(): GoogleAuthClient {
  const clientId = process.env.GOOGLE_CLIENT_ID;
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET;
  const redirectUri = process.env.GOOGLE_REDIRECT_URI;
  if (!clientId || !clientSecret || !redirectUri) {
    throw new Error("GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET, GOOGLE_REDIRECT_URI are required");
  }
  return new google.auth.OAuth2(clientId, clientSecret, redirectUri);
}

function clientFromIntegration(
  integration: GoogleCalendarIntegration,
  encryption: EncryptionService
): GoogleAuthClient {
  const client = createOAuth2Client();
  const accessToken = encryption.decrypt(integration.accessTokenEncrypted);
  const refreshToken = encryption.decrypt(integration.refreshTokenEncrypted);
  client.setCredentials({
    access_token: accessToken,
    refresh_token: refreshToken,
    expiry_date: integration.tokenExpiresAt.getTime(),
  });
  return client;
}

export class GoogleCalendarService {
  constructor(
    private readonly encryption: EncryptionService,
    private readonly integrationRepo: GoogleCalendarIntegrationRepositoryInterface
  ) {}

  getAuthorizationUrl(state: string): string {
    const client = createOAuth2Client();
    return client.generateAuthUrl({
      access_type: "offline",
      prompt: "consent",
      scope: CALENDAR_SCOPES,
      state,
    });
  }

  async exchangeCodeForTokens(
    code: string,
    userId: string,
    organizationId: string
  ): Promise<GoogleCalendarIntegration | null> {
    const client = createOAuth2Client();
    const { tokens } = await client.getToken(code);
    if (!tokens.access_token || !tokens.refresh_token) {
      return null;
    }
    const tokenExpiresAt = tokens.expiry_date
      ? new Date(tokens.expiry_date)
      : new Date(Date.now() + 3600 * 1000);

    const integration = await this.integrationRepo.create({
      userId,
      organizationId,
      accessTokenEncrypted: this.encryption.encrypt(tokens.access_token),
      refreshTokenEncrypted: this.encryption.encrypt(tokens.refresh_token),
      scope: tokens.scope ?? CALENDAR_SCOPES.join(" "),
      tokenExpiresAt,
    });
    return integration;
  }

  async refreshAccessTokenIfNeeded(
    integration: GoogleCalendarIntegration
  ): Promise<GoogleCalendarIntegration | null> {
    const marginMs = 5 * 60 * 1000;
    if (integration.tokenExpiresAt.getTime() > Date.now() + marginMs) {
      return integration;
    }
    const client = createOAuth2Client();
    client.setCredentials({
      refresh_token: this.encryption.decrypt(integration.refreshTokenEncrypted),
    });
    const { credentials } = await client.refreshAccessToken();
    if (!credentials.access_token || !credentials.expiry_date) {
      return null;
    }
    const updated = await this.integrationRepo.update({
      id: integration.id,
      accessTokenEncrypted: this.encryption.encrypt(credentials.access_token),
      tokenExpiresAt: new Date(credentials.expiry_date),
    });
    return updated;
  }

  private hasCalendarScope(scope: string): boolean {
    const s = scope.toLowerCase();
    return (
      s.includes("calendar") ||
      s.includes("calendar.events") ||
      s.includes("calendar.readonly")
    );
  }

  async hasCalendarAccess(
    integration: GoogleCalendarIntegration
  ): Promise<HasCalendarAccessResult> {
    if (!this.hasCalendarScope(integration.scope)) {
      return { ok: false, reason: "insufficientPermissions" };
    }
    let current = integration;
    current = (await this.refreshAccessTokenIfNeeded(current)) ?? current;
    const client = clientFromIntegration(current, this.encryption);
    const calendar = google.calendar({ version: "v3", auth: client });

    try {
      await calendar.calendarList.list({ maxResults: 1 });
      return { ok: true };
    } catch (err: unknown) {
      const code = (err as { code?: number })?.code;
      if (code === 401) {
        return { ok: false, reason: "tokenExpired" };
      }
      if (code === 403) {
        return { ok: false, reason: "insufficientPermissions" };
      }
      throw err;
    }
  }

  async listCalendars(
    integration: GoogleCalendarIntegration
  ): Promise<calendar_v3.Schema$CalendarListEntry[]> {
    let current = integration;
    current = (await this.refreshAccessTokenIfNeeded(current)) ?? current;
    const client = clientFromIntegration(current, this.encryption);
    const calendar = google.calendar({ version: "v3", auth: client });
    const res = await calendar.calendarList.list();
    return res.data.items ?? [];
  }

  async createEvent(
    integration: GoogleCalendarIntegration,
    calendarId: string,
    payload: CreateEventPayload
  ): Promise<calendar_v3.Schema$Event | null> {
    let current = integration;
    current = (await this.refreshAccessTokenIfNeeded(current)) ?? current;
    const client = clientFromIntegration(current, this.encryption);
    const calendar = google.calendar({ version: "v3", auth: client });
    const res = await calendar.events.insert({
      calendarId,
      requestBody: {
        summary: payload.summary,
        description: payload.description,
        start: {
          dateTime: payload.start.dateTime,
          timeZone: payload.start.timeZone ?? TIMEZONE,
        },
        end: {
          dateTime: payload.end.dateTime,
          timeZone: payload.end.timeZone ?? TIMEZONE,
        },
      },
    });
    return res.data ?? null;
  }

  async updateEvent(
    integration: GoogleCalendarIntegration,
    calendarId: string,
    eventId: string,
    payload: Partial<CreateEventPayload>
  ): Promise<calendar_v3.Schema$Event | null> {
    let current = integration;
    current = (await this.refreshAccessTokenIfNeeded(current)) ?? current;
    const client = clientFromIntegration(current, this.encryption);
    const calendar = google.calendar({ version: "v3", auth: client });
    const res = await calendar.events.patch({
      calendarId,
      eventId,
      requestBody: {
        ...(payload.summary != null && { summary: payload.summary }),
        ...(payload.description !== undefined && { description: payload.description }),
        ...(payload.start != null && {
          start: {
            dateTime: payload.start.dateTime,
            timeZone: payload.start.timeZone ?? TIMEZONE,
          },
        }),
        ...(payload.end != null && {
          end: {
            dateTime: payload.end.dateTime,
            timeZone: payload.end.timeZone ?? TIMEZONE,
          },
        }),
      },
    });
    return res.data ?? null;
  }

  async deleteEvent(
    integration: GoogleCalendarIntegration,
    calendarId: string,
    eventId: string
  ): Promise<void> {
    let current = integration;
    current = (await this.refreshAccessTokenIfNeeded(current)) ?? current;
    const client = clientFromIntegration(current, this.encryption);
    const calendar = google.calendar({ version: "v3", auth: client });
    await calendar.events.delete({
      calendarId,
      eventId,
    });
  }

  async createCalendar(
    integration: GoogleCalendarIntegration,
    summary: string
  ): Promise<calendar_v3.Schema$Calendar | null> {
    let current = integration;
    current = (await this.refreshAccessTokenIfNeeded(current)) ?? current;
    const client = clientFromIntegration(current, this.encryption);
    const calendar = google.calendar({ version: "v3", auth: client });
    const res = await calendar.calendars.insert({
      requestBody: { summary },
    });
    return res.data ?? null;
  }
}
