import prismaClient from "../../../services/prisma-client";
import { UpdateUserPermissionUseCase } from "./use-case-update-user-permission";
import { UpdateUserPermissionController } from "./controller-update-user-permission";
import { PrismaUserPermissionRepository } from "../../../repositories/in-prisma/user-permission-in-prisma-repository";


export const updateUserPermissionFactory = () => {
  const prismaUserPermissionRepository = new PrismaUserPermissionRepository(prismaClient);
  const updateUserPermissionsCase = new UpdateUserPermissionUseCase(prismaUserPermissionRepository); 
  const updateUserPermissionController = new UpdateUserPermissionController(updateUserPermissionsCase);

  return updateUserPermissionController;
};
