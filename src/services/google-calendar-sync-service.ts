import prismaClient from "./prisma-client";
import { EncryptionService } from "./encryption-service";
import { GoogleCalendarService } from "./google-calendar-service";
import { PrismaGoogleCalendarIntegrationRepository } from "../repositories/in-prisma/google-calendar-integration-in-prisma-repository";
import { PrismaDateEventRepository } from "../repositories/in-prisma/date-event-in-prisma-repository";
import { DateEventRepositoryInterface } from "../repositories/interface/data-event-repository-interface";
import { formatWallClockGoogleDateTime } from "../functions/wall-clock-datetime";

const TIMEZONE = "America/Sao_Paulo";
const EVENTHUB_LINK = process.env.FRONTEND_URL ?? "https://app.eventhub.com";

export interface DateEventForSync {
  id: string;
  venueId: string;
  title: string;
  type: string;
  startDate: Date;
  endDate: Date;
  proposalId?: string | null;
  googleEventId?: string | null;
  googleCalendarId?: string | null;
}

async function userHasEditVenueCalendar(
  userId: string,
  organizationId: string
): Promise<boolean> {
  const userOrg = await prismaClient.userOrganization.findFirst({
    where: { userId, organizationId },
    select: { id: true },
  });
  if (!userOrg) return false;
  const venuePerms = await prismaClient.userVenuePermission.findMany({
    where: {
      userOrganizationId: userOrg.id,
      venue: { organizationId },
    },
    select: { permissions: true },
  });
  return venuePerms.some((vp) =>
    vp.permissions
      .split(",")
      .map((p) => p.trim())
      .includes("EDIT_VENUE_CALENDAR")
  );
}

export class GoogleCalendarSyncService {
  constructor(
    private readonly encryption: EncryptionService,
    private readonly integrationRepo: PrismaGoogleCalendarIntegrationRepository,
    private readonly calendarService: GoogleCalendarService,
    private readonly dateEventRepo: DateEventRepositoryInterface
  ) {}

  async syncAfterDateEventChange(
    userId: string,
    dateEvent: DateEventForSync,
    operation: "create" | "update" | "delete"
  ): Promise<void> {
    try {
      const venue = await prismaClient.venue.findUnique({
        where: { id: dateEvent.venueId },
        select: { organizationId: true },
      });
      if (!venue) return;

      const hasPermission = await userHasEditVenueCalendar(
        userId,
        venue.organizationId
      );
      if (!hasPermission) return;

      const integration = await this.integrationRepo.findByUserAndOrganization(
        userId,
        venue.organizationId
      );
      if (!integration) return;

      const calendarId =
        integration.googleCalendarId ?? "primary";
      const access = await this.calendarService.hasCalendarAccess(integration);
      if (!access.ok) {
        console.warn(
          "[GoogleCalendarSync] hasCalendarAccess failed:",
          access.reason
        );
        return;
      }

      if (operation === "delete") {
        if (dateEvent.googleEventId) {
          try {
            await this.calendarService.deleteEvent(
              integration,
              calendarId,
              dateEvent.googleEventId
            );
          } catch (err) {
            console.warn("[GoogleCalendarSync] deleteEvent failed", err);
          }
        }
        return;
      }

      const summary = `${dateEvent.type} - ${dateEvent.title}`;
      const description = [
        EVENTHUB_LINK,
        dateEvent.proposalId
          ? `Proposta: ${dateEvent.proposalId}`
          : "",
      ]
        .filter(Boolean)
        .join("\n");
      const startDateTime = formatWallClockGoogleDateTime(new Date(dateEvent.startDate));
      const endDateTime = formatWallClockGoogleDateTime(new Date(dateEvent.endDate));
      const payload = {
        summary,
        description,
        start: { dateTime: startDateTime, timeZone: TIMEZONE },
        end: { dateTime: endDateTime, timeZone: TIMEZONE },
      };

      if (operation === "create") {
        if (dateEvent.googleEventId) return;
        const created = await this.calendarService.createEvent(
          integration,
          calendarId,
          payload
        );
        if (created?.id) {
          await this.dateEventRepo.update({
            dateEventId: dateEvent.id,
            data: {
              googleEventId: created.id,
              googleCalendarId: calendarId,
            },
          });
        }
        return;
      }

      if (operation === "update") {
        if (dateEvent.googleEventId) {
          try {
            await this.calendarService.updateEvent(
              integration,
              calendarId,
              dateEvent.googleEventId,
              payload
            );
          } catch (err: unknown) {
            const code = (err as { code?: number })?.code;
            if (code === 404) {
              const created = await this.calendarService.createEvent(
                integration,
                calendarId,
                payload
              );
              if (created?.id) {
                await this.dateEventRepo.update({
                  dateEventId: dateEvent.id,
                  data: {
                    googleEventId: created.id,
                    googleCalendarId: calendarId,
                  },
                });
              }
            } else {
              console.warn("[GoogleCalendarSync] updateEvent failed", err);
            }
          }
        } else {
          const created = await this.calendarService.createEvent(
            integration,
            calendarId,
            payload
          );
          if (created?.id) {
            await this.dateEventRepo.update({
              dateEventId: dateEvent.id,
              data: {
                googleEventId: created.id,
                googleCalendarId: calendarId,
              },
            });
          }
        }
      }
    } catch (err) {
      console.error("[GoogleCalendarSync]", err);
    }
  }
}

let _syncService: GoogleCalendarSyncService | null = null;

function getSyncService(): GoogleCalendarSyncService {
  if (!_syncService) {
    const encryption = new EncryptionService();
    const integrationRepo = new PrismaGoogleCalendarIntegrationRepository(
      prismaClient
    );
    const calendarService = new GoogleCalendarService(encryption, integrationRepo);
    const dateEventRepo = new PrismaDateEventRepository(prismaClient);
    _syncService = new GoogleCalendarSyncService(
      encryption,
      integrationRepo,
      calendarService,
      dateEventRepo
    );
  }
  return _syncService;
}

export async function syncDateEventToGoogle(
  userId: string,
  dateEvent: DateEventForSync,
  operation: "create" | "update" | "delete"
): Promise<void> {
  const service = getSyncService();
  await service.syncAfterDateEventChange(userId, dateEvent, operation);
}
