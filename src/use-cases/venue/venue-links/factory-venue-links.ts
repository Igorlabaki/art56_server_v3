import { PrismaVenueDomainRepository } from "../../../repositories/in-prisma/venue-domain-in-prisma-repository";
import { PrismaVenueInfoEditPermission, PrismaVenueLinkRepository } from "../../../repositories/in-prisma/venue-link-in-prisma-repository";
import { PrismaVenueSiteEditPermission } from "../../../repositories/in-prisma/venue-site-edit-permission-in-prisma";
import prismaClient from "../../../services/prisma-client";
import { CreateVenueLinkController, GetVenueLinkEditorController, GetVenueLinksController, HideVenueLinkController, OrderVenueLinksController, SaveVenueLinksController, SetVenueLinkVisibleController } from "./controller-venue-links";
import { CreateVenueLinkUseCase, GetVenueLinkEditorUseCase, GetVenueLinksUseCase, HideVenueLinkUseCase, OrderVenueLinksUseCase, SaveVenueLinksUseCase, SetVenueLinkVisibleUseCase } from "./use-case-venue-links";

export const getVenueLinksFactory = () => {
    const links = new PrismaVenueLinkRepository(prismaClient);
    const permission = new PrismaVenueSiteEditPermission(prismaClient);
    return new GetVenueLinksController(new GetVenueLinksUseCase(links, permission, new PrismaVenueDomainRepository(prismaClient)));
};

export const getVenueLinkEditorFactory = () => {
    const links = new PrismaVenueLinkRepository(prismaClient);
    const permission = new PrismaVenueInfoEditPermission(prismaClient);
    return new GetVenueLinkEditorController(new GetVenueLinkEditorUseCase(links, permission));
};

export const saveVenueLinksFactory = () => {
    const links = new PrismaVenueLinkRepository(prismaClient);
    const permission = new PrismaVenueInfoEditPermission(prismaClient);
    return new SaveVenueLinksController(new SaveVenueLinksUseCase(links, permission));
};

export const orderVenueLinksFactory = () => {
    const links = new PrismaVenueLinkRepository(prismaClient);
    const permission = new PrismaVenueSiteEditPermission(prismaClient);
    return new OrderVenueLinksController(new OrderVenueLinksUseCase(links, permission));
};

export const hideVenueLinkFactory = () => {
    const links = new PrismaVenueLinkRepository(prismaClient);
    const permission = new PrismaVenueSiteEditPermission(prismaClient);
    return new HideVenueLinkController(new HideVenueLinkUseCase(links, permission));
};

export const createVenueLinkFactory = () => {
    const links = new PrismaVenueLinkRepository(prismaClient);
    const permission = new PrismaVenueSiteEditPermission(prismaClient);
    return new CreateVenueLinkController(new CreateVenueLinkUseCase(links, permission));
};

export const setVenueLinkVisibleFactory = () => {
    const links = new PrismaVenueLinkRepository(prismaClient);
    const permission = new PrismaVenueSiteEditPermission(prismaClient);
    return new SetVenueLinkVisibleController(new SetVenueLinkVisibleUseCase(links, permission));
};
