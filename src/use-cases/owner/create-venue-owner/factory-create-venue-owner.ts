import prismaClient from "../../../service/prisma-client";

import { PrismaOwnerRepository } from "../../../repositories/in-prisma/owner-in-prisma-repository";
import { CreateVenueOwnerUseCase } from "./use-case-create-venue-owner";
import { CreateVenueOwnerController } from "../create-venue-owner/controller-create-venue-owner";

export const createVenueOwnerFactory = (): CreateVenueOwnerController => {
    const prismaOwnerRepository = new PrismaOwnerRepository(prismaClient);
    const createVenueOwnerUseCase = new CreateVenueOwnerUseCase(prismaOwnerRepository);
    const createVenueOwnerController = new CreateVenueOwnerController(createVenueOwnerUseCase);

    return createVenueOwnerController;
};
