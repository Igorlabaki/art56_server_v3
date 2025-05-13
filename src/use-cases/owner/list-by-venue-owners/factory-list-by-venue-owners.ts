import prismaClient from "../../../services/prisma-client";
import { ListOwnerByVenueIdUseCase } from "./use-case-list-by-venueId-owners";
import { PrismaOwnerRepository } from "../../../repositories/in-prisma/owner-in-prisma-repository";
import { PrismaVenueRepository } from "../../../repositories/in-prisma/venue-in-prisma-repository";
import { PrismaOrganizationRepository } from "../../../repositories/in-prisma/organization-in-prisma-repository";
import { ListOwnerByVenueIdController } from "./controller-list-by-venueId-owners";

export const listOwnerByVenueFactory = (): ListOwnerByVenueIdController => {
    const prismaOwnerRepository = new PrismaOwnerRepository(prismaClient);
    const prismaOrganizationRepository = new PrismaOrganizationRepository(prismaClient);
    const prismaVenueRepository = new PrismaVenueRepository(prismaClient);
    const listOwnerUseCase = new ListOwnerByVenueIdUseCase(prismaOwnerRepository,prismaVenueRepository, prismaOrganizationRepository);
    const listOwnerController = new ListOwnerByVenueIdController(listOwnerUseCase);

    return listOwnerController;
};
