import prismaClient from "../../../services/prisma-client";
import { GetUserOrganizationPermissionByIdUseCase } from "./use-case-get-user-organization-permission-id";
import { GetUserOrganizationPermissionByIdController } from "./controller-get-user-organization-permission-id";
import { PrismaUserOrganizationPermissionRepository } from "../../../repositories/in-prisma/user-organization-permission-in-prisma-repository";

export const getUserOrganizationPermissionByIdFactory = () => {
  const prismaUserOrganizationPermissionRepository = new PrismaUserOrganizationPermissionRepository(prismaClient);
  const getUserOrganizationPermissionByIdUseCase = new GetUserOrganizationPermissionByIdUseCase(prismaUserOrganizationPermissionRepository);
  const getUserOrganizationPermissionByIdController = new GetUserOrganizationPermissionByIdController(getUserOrganizationPermissionByIdUseCase);

  return getUserOrganizationPermissionByIdController;
};
