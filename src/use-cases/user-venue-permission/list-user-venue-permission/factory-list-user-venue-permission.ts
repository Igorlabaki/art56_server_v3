
import prismaClient from "../../../services/prisma-client"; 
import { ListUserVenuePermissionUseCase } from "./use-case-list-user-venue-permission";
import { ListUserVenuePermissionController } from "./controller-list-user-venue-permission";
import { PrismaUserVenuePermissionRepository } from "../../../repositories/in-prisma/user-venue-permission-in-prisma-repository";

export const listUserVenuePermissionFactory = (): ListUserVenuePermissionController => {
    const prismaUserVenuePermissionRepository = new PrismaUserVenuePermissionRepository(prismaClient);
    const prismaUserVenuePermissionRepository2 = new PrismaUserVenuePermissionRepository(prismaClient);
    const listUserVenuePermissionUseCase = new ListUserVenuePermissionUseCase(prismaUserVenuePermissionRepository, prismaUserVenuePermissionRepository2);
        const listUserVenuePermissionController = new ListUserVenuePermissionController(listUserVenuePermissionUseCase);

    return listUserVenuePermissionController;
};
