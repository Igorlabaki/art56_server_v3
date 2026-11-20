import { PrismaProposalRepository } from "../../../repositories/in-prisma/proposal-in-prisma-repository";
import { PrismaVenueRepository } from "../../../repositories/in-prisma/venue-in-prisma-repository";
import { PrismaVenueSiteEditPermission } from "../../../repositories/in-prisma/venue-site-edit-permission-in-prisma";
import prismaClient from "../../../services/prisma-client";
import { ReorderVenueImagesController } from "./controller-reorder-venue-images";
import { ReorderVenueImagesUseCase } from "./use-case-reorder-venue-images";

export const reorderVenueImagesFactory = () => {
    const venues = new PrismaVenueRepository(prismaClient);
    const images = new PrismaProposalRepository(prismaClient);
    const permission = new PrismaVenueSiteEditPermission(prismaClient);
    return new ReorderVenueImagesController(new ReorderVenueImagesUseCase(venues, images, permission));
};
