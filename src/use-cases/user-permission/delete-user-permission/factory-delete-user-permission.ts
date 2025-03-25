import prismaClient from "../../../service/prisma-client";
import { DeleteUserPermissionUseCase } from "./use-case-delete-user-permission";
import { DeleteUserPermissionController } from "./controller-delete-user-permission";
import { PrismaUserPermissionRepository } from "../../../repositories/in-prisma/user-permission-in-prisma-repository";

export const deleteUserPermissionFactory = () => {
  const prismaUserPermissionRepository = new PrismaUserPermissionRepository(prismaClient);
  const deleteUserPermissionCase = new DeleteUserPermissionUseCase(prismaUserPermissionRepository);
  const deleteUserPermissionController = new DeleteUserPermissionController(deleteUserPermissionCase);

  return deleteUserPermissionController;
};
