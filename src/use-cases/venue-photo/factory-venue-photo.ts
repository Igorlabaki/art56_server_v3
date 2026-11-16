import { PrismaUserVenuePermissionRepository } from "../../repositories/in-prisma/user-venue-permission-in-prisma-repository";
import { PrismaVenuePhotoRepository } from "../../repositories/in-prisma/venue-photo-in-prisma-repository";
import { PrismaVenueRepository } from "../../repositories/in-prisma/venue-in-prisma-repository";
import prismaClient from "../../services/prisma-client";
import { venuePhotoStorage } from "../../functions/venue-photo-storage";
import { VenuePhotoController } from "./controller-venue-photo";
import { VenuePhotoUseCase } from "./use-case-venue-photo";
import { VenuePhotoAuthorizer } from "./venue-photo-authorizer";

export function venuePhotoFactory() {
    const repository = new PrismaVenuePhotoRepository(prismaClient);
    const authorizer = new VenuePhotoAuthorizer(
        new PrismaVenueRepository(prismaClient),
        new PrismaUserVenuePermissionRepository(prismaClient),
    );
    return new VenuePhotoController(new VenuePhotoUseCase(repository, authorizer, venuePhotoStorage));
}
