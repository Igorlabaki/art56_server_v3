import { PrismaServiceRepository } from "../../../repositories/in-prisma/service-in-prisma-repository";
import { PrismaUserVenuePermissionRepository } from "../../../repositories/in-prisma/user-venue-permission-in-prisma-repository";
import { PrismaVenueRepository } from "../../../repositories/in-prisma/venue-in-prisma-repository";
import prismaClient from "../../../services/prisma-client";
import { ServiceAuthorizer } from "../service-authorizer";
import { DeleteServiceController } from "./controller-delete-text";
import { DeleteServiceUseCase } from "./use-case-delete-service";

export const deleteServiceFactory = () => {
    const prismaServiceRepository = new PrismaServiceRepository(prismaClient);
    const authorizer = new ServiceAuthorizer(
        new PrismaVenueRepository(prismaClient),
        new PrismaUserVenuePermissionRepository(prismaClient),
    );
    const deleteServiceCase = new DeleteServiceUseCase(prismaServiceRepository, authorizer);
    return new DeleteServiceController(deleteServiceCase);
};
