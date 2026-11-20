import { PrismaVenueRepository } from "../../../repositories/in-prisma/venue-in-prisma-repository";
import { PrismaVenueSiteEditPermission } from "../../../repositories/in-prisma/venue-site-edit-permission-in-prisma";
import prismaClient from "../../../services/prisma-client";
import { GetVenuePresentationController } from "./controller-get-venue-presentation";
import { GetVenuePresentationUseCase } from "./use-case-get-venue-presentation";

export const getVenuePresentationFactory = () => {
    const venues = new PrismaVenueRepository(prismaClient);
    const permission = new PrismaVenueSiteEditPermission(prismaClient);
    return new GetVenuePresentationController(new GetVenuePresentationUseCase(venues, permission));
};
