import { PrismaVenueLinkRepository } from "../../../repositories/in-prisma/venue-link-in-prisma-repository";
import { PrismaPublicSurfaceStore } from "../../../repositories/in-prisma/public-surface-in-prisma";
import { PrismaVenueSiteViewPermission } from "../../../repositories/in-prisma/venue-site-view-permission-in-prisma";
import prismaClient from "../../../services/prisma-client";
import { GetPublicSurfaceStatsController } from "./controller-public-surface-stats";
import { GetPublicSurfaceStatsUseCase } from "./use-case-public-surface-stats";

export const getPublicSurfaceStatsFactory = () => {
    const links = new PrismaVenueLinkRepository(prismaClient);
    const permission = new PrismaVenueSiteViewPermission(prismaClient);
    const surfaces = new PrismaPublicSurfaceStore(prismaClient);
    return new GetPublicSurfaceStatsController(new GetPublicSurfaceStatsUseCase(links, permission, surfaces));
};
