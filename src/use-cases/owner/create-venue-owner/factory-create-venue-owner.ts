import prismaClient from "../../../services/prisma-client";

import { PrismaOwnerRepository } from "../../../repositories/in-prisma/owner-in-prisma-repository";
import { CreateVenueOwnerUseCase } from "./use-case-create-venue-owner";
import { CreateVenueOwnerController } from "../create-venue-owner/controller-create-venue-owner";
import { ownerAuthorizerFactory } from "../factory-owner-authorizer";

export const createVenueOwnerFactory = (): CreateVenueOwnerController => {
    const prismaOwnerRepository = new PrismaOwnerRepository(prismaClient);
    const createVenueOwnerUseCase = new CreateVenueOwnerUseCase(prismaOwnerRepository, ownerAuthorizerFactory());
    const createVenueOwnerController = new CreateVenueOwnerController(createVenueOwnerUseCase);

    return createVenueOwnerController;
};
