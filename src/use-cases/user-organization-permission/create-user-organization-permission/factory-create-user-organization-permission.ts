import prismaClient from "../../../services/prisma-client";
import { CreateUserOrganizationPermissionUseCase } from "./use-case-create-user-organization-permission";
import { CreateUserOrganizationPermissionController } from "./controller-create-user-organization-permission";
import { PrismaUserOrganizationPermissionRepository } from "../../../repositories/in-prisma/user-organization-permission-in-prisma-repository";
import { PrismaUserOrganizationRepository } from "../../../repositories/in-prisma/user-organization-in-prisma-repository";

export const createUserOrganizationPermissionFactory = () => {
  const prismaUserOrganizationPermissionRepository = new PrismaUserOrganizationPermissionRepository(prismaClient);
  const prismaUserOrganizationRepository = new PrismaUserOrganizationRepository(prismaClient);
  const createUserOrganizationPermissionsCase = new CreateUserOrganizationPermissionUseCase(prismaUserOrganizationPermissionRepository, prismaUserOrganizationRepository); 
  const createUserOrganizationPermissionController = new CreateUserOrganizationPermissionController(createUserOrganizationPermissionsCase);

  return createUserOrganizationPermissionController;
};
