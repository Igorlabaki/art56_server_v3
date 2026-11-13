import { amenityImageStorage } from "../../../functions/venue-amenity-image-storage";
import { PrismaUserVenuePermissionRepository } from "../../../repositories/in-prisma/user-venue-permission-in-prisma-repository";
import { PrismaVenueRepository } from "../../../repositories/in-prisma/venue-in-prisma-repository";
import { PrismaVenueAmenityRepository } from "../../../repositories/in-prisma/venue-amenity-in-prisma-repository";
import prismaClient from "../../../services/prisma-client";
import { VenueAmenityAuthorizer } from "../venue-amenity-authorizer";
import { UpdateVenueAmenityController } from "./controller-update-venue-amenity";
import { UpdateVenueAmenityUseCase } from "./use-case-update-venue-amenity";

export const updateVenueAmenityFactory = () => {
    const repository = new PrismaVenueAmenityRepository(prismaClient);
    const authorizer = new VenueAmenityAuthorizer(
        new PrismaVenueRepository(prismaClient),
        new PrismaUserVenuePermissionRepository(prismaClient),
    );
    return new UpdateVenueAmenityController(new UpdateVenueAmenityUseCase(repository, authorizer, amenityImageStorage));
};
