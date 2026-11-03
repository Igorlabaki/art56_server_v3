import { Router, Request, Response } from "express";
import { sign, verify } from "jsonwebtoken";
import { ensureAuthenticate } from "../middleware/ensureAuthenticate";
import { ensurePermission } from "../middleware/ensurePermission";
import { AuthenticatedRequest } from "../types/authenticated-request";
import { EncryptionService } from "../services/encryption-service";
import { GoogleCalendarService } from "../services/google-calendar-service";
import { PrismaGoogleCalendarIntegrationRepository } from "../repositories/in-prisma/google-calendar-integration-in-prisma-repository";
import prismaClient from "../services/prisma-client";

const router = Router();
const encryption = new EncryptionService();
const integrationRepo = new PrismaGoogleCalendarIntegrationRepository(prismaClient);
const googleCalendarService = new GoogleCalendarService(encryption, integrationRepo);

const FRONTEND_REDIRECT_BASE =
  process.env.FRONTEND_URL ?? "http://localhost:5173";

function buildFrontendRedirect(path: string, params: Record<string, string>): string {
  const url = new URL(path, FRONTEND_REDIRECT_BASE);
  Object.entries(params).forEach(([k, v]) => url.searchParams.set(k, v));
  return url.toString();
}

/** GET /integrations/google-calendar/auto-status?organizationId=... */
router.get(
  "/auto-status",
  ensureAuthenticate,
  ensurePermission("VIEW_VENUE_CALENDAR"),
  async (req, res) => {
    try {
      const authReq = req as AuthenticatedRequest;
      const organizationId = req.query.organizationId as string;
      if (!organizationId) {
        return void res.status(400).json({
          title: "Bad Request",
          message: "organizationId é obrigatório",
        });
      }
      const userId = authReq.user.id;
      const integration = await integrationRepo.findByUserAndOrganization(
        userId,
        organizationId
      );
      if (!integration) {
        return void res.json({
          connected: false,
          needsGooglePermission: false,
        });
      }
      const access = await googleCalendarService.hasCalendarAccess(integration);
      if (access.ok) {
        return void res.json({
          connected: true,
          calendarId: integration.googleCalendarId ?? undefined,
        });
      }
      return void res.json({
        connected: false,
        needsGooglePermission: access.reason === "insufficientPermissions",
        calendarId: integration.googleCalendarId ?? undefined,
      });
    } catch (error) {
      console.error("[auto-status]", error);
      return void res.status(500).json({
        title: "Internal Server Error",
        message: "Erro ao verificar status da integração.",
      });
    }
  }
);

/** GET /integrations/google-calendar/connect?organizationId=... - redirect to Google */
router.get(
  "/connect",
  ensureAuthenticate,
  ensurePermission("VIEW_VENUE_CALENDAR"),
  async (req, res) => {
    try {
      const authReq = req as AuthenticatedRequest;
      const organizationId = req.query.organizationId as string;
      if (!organizationId) {
        return void res.status(400).json({
          title: "Bad Request",
          message: "organizationId é obrigatório",
        });
      }
      const userId = authReq.user.id;
      const state = sign(
        { userId, organizationId },
        process.env.JWT_SECRET_KEY!,
        { expiresIn: "10m" }
      );
      const url = googleCalendarService.getAuthorizationUrl(state);
      return void res.redirect(url);
    } catch (error) {
      console.error("[connect]", error);
      return void res.redirect(
        buildFrontendRedirect("/", {
          google_calendar: "error",
          message: "Erro ao iniciar conexão com Google Calendar.",
        })
      );
    }
  }
);

/** GET /integrations/google-calendar/connect-url?organizationId=... - returns JSON { redirectUrl } for frontend */
router.get(
  "/connect-url",
  ensureAuthenticate,
  ensurePermission("VIEW_VENUE_CALENDAR"),
  async (req, res) => {
    try {
      const authReq = req as AuthenticatedRequest;
      const organizationId = req.query.organizationId as string;
      if (!organizationId) {
        return void res.status(400).json({
          title: "Bad Request",
          message: "organizationId é obrigatório",
        });
      }
      const userId = authReq.user.id;
      const state = sign(
        { userId, organizationId },
        process.env.JWT_SECRET_KEY!,
        { expiresIn: "10m" }
      );
      const redirectUrl = googleCalendarService.getAuthorizationUrl(state);
      return void res.json({ redirectUrl });
    } catch (error) {
      console.error("[connect-url]", error);
      return void res.status(500).json({
        title: "Internal Server Error",
        message: "Erro ao obter URL de conexão.",
      });
    }
  }
);

/** GET /integrations/google-calendar/callback?code=...&state=... */
router.get("/callback", async (req: Request, res: Response) => {
  try {
    const code = req.query.code as string;
    const state = req.query.state as string;
    if (!code || !state) {
      return void res.redirect(
        buildFrontendRedirect("/", {
          google_calendar: "error",
          message: "Parâmetros code e state são obrigatórios.",
        })
      );
    }
    const decoded = verify(state, process.env.JWT_SECRET_KEY!) as {
      userId: string;
      organizationId: string;
    };
    const integration = await googleCalendarService.exchangeCodeForTokens(
      code,
      decoded.userId,
      decoded.organizationId
    );
    if (!integration) {
      return void res.redirect(
        buildFrontendRedirect("/", {
          google_calendar: "error",
          message: "Não foi possível obter tokens do Google.",
        })
      );
    }
    return void res.redirect(
      buildFrontendRedirect("/", {
        google_calendar: "connected",
        organizationId: decoded.organizationId,
      })
    );
  } catch (error) {
    console.error("[callback]", error);
    return void res.redirect(
      buildFrontendRedirect("/", {
        google_calendar: "error",
        message: "Erro ao conectar Google Calendar.",
      })
    );
  }
});

/** GET /integrations/google-calendar/calendars?organizationId=... */
router.get(
  "/calendars",
  ensureAuthenticate,
  ensurePermission("VIEW_VENUE_CALENDAR"),
  async (req, res) => {
    try {
      const authReq = req as AuthenticatedRequest;
      const organizationId = req.query.organizationId as string;
      if (!organizationId) {
        return void res.status(400).json({
          title: "Bad Request",
          message: "organizationId é obrigatório",
        });
      }
      const userId = authReq.user.id;
      const integration = await integrationRepo.findByUserAndOrganization(
        userId,
        organizationId
      );
      if (!integration) {
        return void res.status(404).json({
          title: "Not Found",
          message: "Integração não encontrada. Conecte o Google Calendar primeiro.",
        });
      }
      const items = await googleCalendarService.listCalendars(integration);
      return void res.json({
        calendars: items.map((c) => ({
          id: c.id,
          summary: c.summary,
          primary: c.primary ?? false,
        })),
      });
    } catch (error) {
      console.error("[calendars]", error);
      return void res.status(500).json({
        title: "Internal Server Error",
        message: "Erro ao listar calendários.",
      });
    }
  }
);

/** POST /integrations/google-calendar/select-calendar { organizationId, calendarId } */
router.post(
  "/select-calendar",
  ensureAuthenticate,
  ensurePermission("EDIT_VENUE_CALENDAR"),
  async (req, res) => {
    try {
      const authReq = req as AuthenticatedRequest;
      const { organizationId, calendarId } = req.body ?? {};
      if (!organizationId || !calendarId) {
        return void res.status(400).json({
          title: "Bad Request",
          message: "organizationId e calendarId são obrigatórios",
        });
      }
      const userId = authReq.user.id;
      const integration = await integrationRepo.findByUserAndOrganization(
        userId,
        organizationId
      );
      if (!integration) {
        return void res.status(404).json({
          title: "Not Found",
          message: "Integração não encontrada.",
        });
      }
      await integrationRepo.update({
        id: integration.id,
        googleCalendarId: calendarId,
      });
      return void res.json({
        success: true,
        message: "Calendário selecionado.",
        calendarId,
      });
    } catch (error) {
      console.error("[select-calendar]", error);
      return void res.status(500).json({
        title: "Internal Server Error",
        message: "Erro ao selecionar calendário.",
      });
    }
  }
);

/** POST /integrations/google-calendar/disconnect { organizationId } or ?organizationId= */
router.post(
  "/disconnect",
  ensureAuthenticate,
  ensurePermission("EDIT_VENUE_CALENDAR"),
  async (req, res) => {
    try {
      const authReq = req as AuthenticatedRequest;
      const organizationId =
        (req.body?.organizationId as string) ||
        (req.query.organizationId as string);
      if (!organizationId) {
        return void res.status(400).json({
          title: "Bad Request",
          message: "organizationId é obrigatório",
        });
      }
      const userId = authReq.user.id;
      const integration = await integrationRepo.findByUserAndOrganization(
        userId,
        organizationId
      );
      if (!integration) {
        return void res.json({
          success: true,
          message: "Integração já estava desconectada.",
        });
      }
      await integrationRepo.delete(integration.id);
      return void res.json({
        success: true,
        message: "Google Calendar desconectado.",
      });
    } catch (error) {
      console.error("[disconnect]", error);
      return void res.status(500).json({
        title: "Internal Server Error",
        message: "Erro ao desconectar.",
      });
    }
  }
);

export const integrationsGoogleCalendarRoutes = router;
