import prismaClient from "../../../services/prisma-client";
import { CreateUserPermissionUseCase } from "./use-case-create-user-permission";
import { CreateUserPermissionController } from "./controller-create-user-permission";
import { PrismaUserPermissionRepository } from "../../../repositories/in-prisma/user-permission-in-prisma-repository";
import { PrismaUserOrganizationRepository } from "../../../repositories/in-prisma/user-organization-in-prisma-repository";
import { userorganizationRoutes } from "../../../router/userOrganization";


export const createUserPermissionFactory = () => {
  const prismaUserPermissionRepository = new PrismaUserPermissionRepository(prismaClient);
  const prismaUserOrganizationRepository = new PrismaUserOrganizationRepository(prismaClient);
  const createUserPermissionsCase = new CreateUserPermissionUseCase(prismaUserPermissionRepository, prismaUserOrganizationRepository); 
  const createUserPermissionController = new CreateUserPermissionController(createUserPermissionsCase);

  return createUserPermissionController;
};
