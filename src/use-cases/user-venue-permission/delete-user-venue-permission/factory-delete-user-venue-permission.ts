import prismaClient from "../../../services/prisma-client";
import { DeleteUserVenuePermissionUseCase } from "./use-case-delete-user-venue-permission";
import { DeleteUserVenuePermissionController } from "./controller-delete-user-venue-permission";
import { PrismaUserVenuePermissionRepository } from "../../../repositories/in-prisma/user-venue-permission-in-prisma-repository";

export const deleteUserVenuePermissionFactory = () => {
  const prismaUserVenuePermissionRepository = new PrismaUserVenuePermissionRepository(prismaClient);
  const deleteUserVenuePermissionCase = new DeleteUserVenuePermissionUseCase(prismaUserVenuePermissionRepository);
  const deleteUserVenuePermissionController = new DeleteUserVenuePermissionController(deleteUserVenuePermissionCase);

  return deleteUserVenuePermissionController;
};
