import prismaClient from "../../../services/prisma-client";
import { GetUserVenuePermissionUseCase } from "./use-case-get-user-venue-permission-id";
import { GetUserVenuePermissionController } from "./controller-get-user-venue-permission-id";
import { PrismaUserVenuePermissionRepository } from "../../../repositories/in-prisma/user-venue-permission-in-prisma-repository";

export const getUserVenuePermissionFactory = () => {
  const prismaUserVenuePermissionRepository = new PrismaUserVenuePermissionRepository(prismaClient);
  const getUserVenuePermissionUseCase = new GetUserVenuePermissionUseCase(prismaUserVenuePermissionRepository);
  const getUserVenuePermissionController = new GetUserVenuePermissionController(getUserVenuePermissionUseCase);

  return getUserVenuePermissionController;
};
