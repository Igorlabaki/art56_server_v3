import { deleteServiceImage } from "../../../functions/service-image-storage";
import { PrismaServiceRepository } from "../../../repositories/in-prisma/service-in-prisma-repository";
import { PrismaUserVenuePermissionRepository } from "../../../repositories/in-prisma/user-venue-permission-in-prisma-repository";
import { PrismaVenueRepository } from "../../../repositories/in-prisma/venue-in-prisma-repository";
import prismaClient from "../../../services/prisma-client";
import { ServiceAuthorizer } from "../service-authorizer";
import { UpdateServiceController } from "./controller-update-service";
import { UpdateServiceUseCase } from "./use-case-update-service";

export const updateServiceFactory = () => {
    const prismaServiceRepository = new PrismaServiceRepository(prismaClient);
    const authorizer = new ServiceAuthorizer(
        new PrismaVenueRepository(prismaClient),
        new PrismaUserVenuePermissionRepository(prismaClient),
    );
    const updateServiceCase = new UpdateServiceUseCase(prismaServiceRepository, authorizer, deleteServiceImage);
    return new UpdateServiceController(updateServiceCase);
};
