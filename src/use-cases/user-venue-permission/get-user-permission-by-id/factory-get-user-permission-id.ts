import prismaClient from "../../../services/prisma-client";
import { GetUserVenuePermissionByIdController } from "./controller-get-user-permission-id";
import { PrismaUserVenuePermissionRepository } from "../../../repositories/in-prisma/user-venue-permission-in-prisma-repository";
import { GetUserVenuePermissionByIdUseCase } from "./use-case-get-user-permission-id";
   

export const getUserVenuePermissionByIdFactory = () => {
  const prismaUserVenuePermissionRepository = new PrismaUserVenuePermissionRepository(prismaClient);
  const getUserVenuePermissionByIdUseCase = new GetUserVenuePermissionByIdUseCase(prismaUserVenuePermissionRepository);
  const getUserVenuePermissionByIdController = new GetUserVenuePermissionByIdController(getUserVenuePermissionByIdUseCase);

  return getUserVenuePermissionByIdController;
};
