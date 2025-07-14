import prismaClient from "../../../services/prisma-client";
import { CreateUserVenuePermissionUseCase } from "./use-case-create-user-venue-permission";
import { CreateUserVenuePermissionController } from "./controller-create-user-venue-permission";
import { PrismaUserVenuePermissionRepository } from "../../../repositories/in-prisma/user-venue-permission-in-prisma-repository";
import { PrismaUserOrganizationRepository } from "../../../repositories/in-prisma/user-organization-in-prisma-repository";

export const createUserVenuePermissionFactory = () => {
  const prismaUserVenuePermissionRepository = new PrismaUserVenuePermissionRepository(prismaClient);
  const prismaUserOrganizationRepository = new PrismaUserOrganizationRepository(prismaClient);
  const createUserVenuePermissionsCase = new CreateUserVenuePermissionUseCase(prismaUserVenuePermissionRepository, prismaUserOrganizationRepository); 
  const createUserVenuePermissionController = new CreateUserVenuePermissionController(createUserVenuePermissionsCase);

  return createUserVenuePermissionController;
};
