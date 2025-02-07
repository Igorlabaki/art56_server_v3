import prismaClient from "../../../service/prisma-client";
import { ListVenuesUseCase } from "./use-case-list-venue";
import { ListVenueController } from "./controller-list-venue";
import { PrismaVenueRepository } from "../../../repositories/in-prisma/venue-in-prisma-repository";


export const listVenueFactory = (): ListVenueController => {
    const prismaVenueRepository = new PrismaVenueRepository(prismaClient);
    const listVenueUseCase = new ListVenuesUseCase(prismaVenueRepository);
    const listVenueController = new ListVenueController(listVenueUseCase);

    return listVenueController;
};
