import prismaClient from "../../../services/prisma-client";
import { ListOwnerByVenueIdUseCase } from "./use-case-list-by-venueId-owners";
import { PrismaOwnerRepository } from "../../../repositories/in-prisma/owner-in-prisma-repository";
import { ListOwnerByVenueIdController } from "./controller-list-by-venueId-owners";
import { ownerAuthorizerFactory } from "../factory-owner-authorizer";

export const listOwnerByVenueFactory = (): ListOwnerByVenueIdController => {
    const prismaOwnerRepository = new PrismaOwnerRepository(prismaClient);
    const listOwnerUseCase = new ListOwnerByVenueIdUseCase(prismaOwnerRepository, ownerAuthorizerFactory());
    const listOwnerController = new ListOwnerByVenueIdController(listOwnerUseCase);

    return listOwnerController;
};
