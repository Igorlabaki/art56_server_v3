import prismaClient from "../../../services/prisma-client";
import { DeleteUserOrganizationPermissionUseCase } from "./use-case-delete-user-organization-permission";
import { DeleteUserOrganizationPermissionController } from "./controller-delete-user-organization-permission";
import { PrismaUserOrganizationPermissionRepository } from "../../../repositories/in-prisma/user-organization-permission-in-prisma-repository";

export const deleteUserOrganizationPermissionFactory = () => {
  const prismaUserOrganizationPermissionRepository = new PrismaUserOrganizationPermissionRepository(prismaClient);
  const deleteUserOrganizationPermissionCase = new DeleteUserOrganizationPermissionUseCase(prismaUserOrganizationPermissionRepository);
  const deleteUserOrganizationPermissionController = new DeleteUserOrganizationPermissionController(deleteUserOrganizationPermissionCase);

  return deleteUserOrganizationPermissionController;
};
