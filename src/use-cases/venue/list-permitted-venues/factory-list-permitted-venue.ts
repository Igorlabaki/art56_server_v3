import { PrismaVenueRepository } from "../../../repositories/in-prisma/venue-in-prisma-repository";
import prismaClient from "../../../services/prisma-client";
import { ListPermittedVenueController } from "./controller-list-permitted-venue";
import { ListPermittedVenuesUseCase } from "./use-case-list-permitted-venue";

export const listPermittedVenueFactory = (): ListPermittedVenueController => {
    const prismaPermittedVenueRepository = new PrismaVenueRepository(prismaClient);
    const listPermittedVenueUseCase = new ListPermittedVenuesUseCase(prismaPermittedVenueRepository);
    const listPermittedVenueController = new ListPermittedVenueController(listPermittedVenueUseCase);

    return listPermittedVenueController;
};
