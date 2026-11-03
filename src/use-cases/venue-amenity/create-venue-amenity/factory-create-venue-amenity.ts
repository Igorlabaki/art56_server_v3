import { PrismaUserVenuePermissionRepository } from "../../../repositories/in-prisma/user-venue-permission-in-prisma-repository";
import { PrismaVenueRepository } from "../../../repositories/in-prisma/venue-in-prisma-repository";
import { PrismaVenueAmenityRepository } from "../../../repositories/in-prisma/venue-amenity-in-prisma-repository";
import prismaClient from "../../../services/prisma-client";
import { VenueAmenityAuthorizer } from "../venue-amenity-authorizer";
import { CreateVenueAmenityController } from "./controller-create-venue-amenity";
import { CreateVenueAmenityUseCase } from "./use-case-create-venue-amenity";

export const createVenueAmenityFactory = () => {
    const repository = new PrismaVenueAmenityRepository(prismaClient);
    const authorizer = new VenueAmenityAuthorizer(
        new PrismaVenueRepository(prismaClient),
        new PrismaUserVenuePermissionRepository(prismaClient),
    );
    return new CreateVenueAmenityController(new CreateVenueAmenityUseCase(repository, authorizer));
};
