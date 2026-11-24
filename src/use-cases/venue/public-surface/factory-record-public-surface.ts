import { PrismaPublicSurfaceStore } from "../../../repositories/in-prisma/public-surface-in-prisma";
import { PrismaVenueDomainRepository } from "../../../repositories/in-prisma/venue-domain-in-prisma-repository";
import { PrismaVenueLinkRepository } from "../../../repositories/in-prisma/venue-link-in-prisma-repository";
import { PrismaVenueSiteEditPermission } from "../../../repositories/in-prisma/venue-site-edit-permission-in-prisma";
import prismaClient from "../../../services/prisma-client";
import { publicSurfaceViewLimiter } from "../../../functions/public-surface-limit";
import { GetVenueLinksUseCase } from "../venue-links/use-case-venue-links";
import { RecordPublicSurfaceClickController, RecordPublicSurfaceViewController } from "./controller-record-public-surface";
import { RecordPublicSurfaceClickUseCase, RecordPublicSurfaceViewUseCase } from "./use-case-record-public-surface";

export const recordPublicSurfaceViewFactory = () => {
    const links = new PrismaVenueLinkRepository(prismaClient);
    const surfaces = new PrismaPublicSurfaceStore(prismaClient);
    return new RecordPublicSurfaceViewController(
        new RecordPublicSurfaceViewUseCase(links, surfaces, publicSurfaceViewLimiter),
    );
};

export const recordPublicSurfaceClickFactory = () => {
    const links = new PrismaVenueLinkRepository(prismaClient);
    const permission = new PrismaVenueSiteEditPermission(prismaClient);
    const read = new GetVenueLinksUseCase(links, permission, new PrismaVenueDomainRepository(prismaClient));
    const surfaces = new PrismaPublicSurfaceStore(prismaClient);
    return new RecordPublicSurfaceClickController(new RecordPublicSurfaceClickUseCase(read, links, surfaces));
};
