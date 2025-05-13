import prismaClient from "../../../services/prisma-client";
import { CreateVenueUseCase } from "./use-case-create-venue";
import { CreateVenueController } from "./controller-create-venue";
import { PrismaVenueRepository } from "../../../repositories/in-prisma/venue-in-prisma-repository";


export const createVenueFactory = (): CreateVenueController => {
    const prismaVenueRepository = new PrismaVenueRepository(prismaClient);
    const createVenueUseCase = new CreateVenueUseCase(prismaVenueRepository);
    const createVenueController = new CreateVenueController(createVenueUseCase);

    return createVenueController;
};
