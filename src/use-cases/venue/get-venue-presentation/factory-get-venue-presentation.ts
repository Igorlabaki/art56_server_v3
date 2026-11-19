import { PrismaVenueRepository } from "../../../repositories/in-prisma/venue-in-prisma-repository";
import prismaClient from "../../../services/prisma-client";
import { GetVenuePresentationController } from "./controller-get-venue-presentation";
import { GetVenuePresentationUseCase } from "./use-case-get-venue-presentation";

export const getVenuePresentationFactory = () => {
    const venues = new PrismaVenueRepository(prismaClient);
    return new GetVenuePresentationController(new GetVenuePresentationUseCase(venues));
};
