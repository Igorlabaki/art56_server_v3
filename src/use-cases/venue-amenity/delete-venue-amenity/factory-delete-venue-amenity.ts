import { amenityImageStorage } from "../../../functions/venue-amenity-image-storage";
import { PrismaUserVenuePermissionRepository } from "../../../repositories/in-prisma/user-venue-permission-in-prisma-repository";
import { PrismaVenueRepository } from "../../../repositories/in-prisma/venue-in-prisma-repository";
import { PrismaVenueAmenityRepository } from "../../../repositories/in-prisma/venue-amenity-in-prisma-repository";
import prismaClient from "../../../services/prisma-client";
import { VenueAmenityAuthorizer } from "../venue-amenity-authorizer";
import { DeleteVenueAmenityController } from "./controller-delete-venue-amenity";
import { DeleteVenueAmenityUseCase } from "./use-case-delete-venue-amenity";

export const deleteVenueAmenityFactory = () => {
    const repository = new PrismaVenueAmenityRepository(prismaClient);
    const authorizer = new VenueAmenityAuthorizer(
        new PrismaVenueRepository(prismaClient),
        new PrismaUserVenuePermissionRepository(prismaClient),
    );
    return new DeleteVenueAmenityController(new DeleteVenueAmenityUseCase(repository, authorizer, amenityImageStorage));
};
