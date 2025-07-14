import prismaClient from "../../../services/prisma-client";
import { UpdateUserVenuePermissionUseCase } from "./use-case-update-user-venue-permission";
import { UpdateUserVenuePermissionController } from "./controller-update-user-venue-permission";
import { PrismaUserVenuePermissionRepository } from "../../../repositories/in-prisma/user-venue-permission-in-prisma-repository";


export const updateUserVenuePermissionFactory = () => {
  const prismaUserVenuePermissionRepository = new PrismaUserVenuePermissionRepository(prismaClient);
  const updateUserVenuePermissionsCase = new UpdateUserVenuePermissionUseCase(prismaUserVenuePermissionRepository); 
  const updateUserVenuePermissionController = new UpdateUserVenuePermissionController(updateUserVenuePermissionsCase);

  return updateUserVenuePermissionController;
};
