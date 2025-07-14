import prismaClient from "../../../services/prisma-client";
import { UpdateUserOrganizationPermissionUseCase } from "./use-case-update-user-organization-permission";
import { UpdateUserOrganizationPermissionController } from "./controller-update-user-organization-permission";
import { PrismaUserOrganizationPermissionRepository } from "../../../repositories/in-prisma/user-organization-permission-in-prisma-repository";


export const updateUserOrganizationPermissionFactory = () => {
  const prismaUserOrganizationPermissionRepository = new PrismaUserOrganizationPermissionRepository(prismaClient);
  const updateUserOrganizationPermissionsCase = new UpdateUserOrganizationPermissionUseCase(prismaUserOrganizationPermissionRepository); 
  const updateUserOrganizationPermissionController = new UpdateUserOrganizationPermissionController(updateUserOrganizationPermissionsCase);

      return updateUserOrganizationPermissionController;
};
