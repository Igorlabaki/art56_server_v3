import { NextFunction, Request, Response } from "express";
import prismaClient from "../services/prisma-client";
import { AuthenticatedRequest } from "../types/authenticated-request";

const FORBIDDEN_MESSAGE =
  "Você não tem permissão para acessar o calendário. Solicite ao administrador.";

/**
 * Middleware that checks if the authenticated user has the given permission
 * in the context of the organization (from query or body).
 * Permission is checked via UserVenuePermission: user must have the permission
 * in at least one venue of the organization.
 * Requires ensureAuthenticate to have run first (req.user.id set).
 */
export function ensurePermission(permission: string) {
  return async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    const authReq = req as AuthenticatedRequest;
    const userId = authReq.user?.id;
    if (!userId) {
      res.status(401).json({
        title: "Unauthorized",
        message: "Token inválido ou ausente.",
      });
      return;
    }

    const organizationId =
      (req.query.organizationId as string) ||
      (req.body?.organizationId as string);
    if (!organizationId) {
      res.status(400).json({
        title: "Bad Request",
        message: "organizationId é obrigatório (query ou body).",
      });
      return;
    }

    try {
      const userOrganization = await prismaClient.userOrganization.findFirst({
        where: {
          userId,
          organizationId,
        },
        select: { id: true },
      });

      if (!userOrganization) {
        res.status(403).json({
          title: "Forbidden",
          message: FORBIDDEN_MESSAGE,
        });
        return;
      }

      const venuePermissions = await prismaClient.userVenuePermission.findMany({
        where: {
          userOrganizationId: userOrganization.id,
          venue: {
            organizationId,
          },
        },
        select: { permissions: true },
      });

      const hasPermission = venuePermissions.some((vp) =>
        vp.permissions.split(",").map((p) => p.trim()).includes(permission)
      );

      if (!hasPermission) {
        res.status(403).json({
          title: "Forbidden",
          message: FORBIDDEN_MESSAGE,
        });
        return;
      }

      next();
    } catch (error) {
      console.error("[ensurePermission]", error);
      res.status(500).json({
        title: "Internal Server Error",
        message: "Erro ao verificar permissão.",
      });
    }
  };
}
