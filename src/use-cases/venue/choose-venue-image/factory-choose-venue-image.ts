import { PrismaProposalRepository } from "../../../repositories/in-prisma/proposal-in-prisma-repository";
import { PrismaVenueRepository } from "../../../repositories/in-prisma/venue-in-prisma-repository";
import { PrismaVenueSiteEditPermission } from "../../../repositories/in-prisma/venue-site-edit-permission-in-prisma";
import prismaClient from "../../../services/prisma-client";
import { ChooseVenueImageController } from "./controller-choose-venue-image";
import { ChooseVenueImageUseCase } from "./use-case-choose-venue-image";

export const chooseVenueImageFactory = () => {
    const venues = new PrismaVenueRepository(prismaClient);
    const images = new PrismaProposalRepository(prismaClient);
    const permission = new PrismaVenueSiteEditPermission(prismaClient);
    return new ChooseVenueImageController(new ChooseVenueImageUseCase(venues, images, permission));
};
