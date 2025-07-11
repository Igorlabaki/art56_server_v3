import prismaClient from "../../../services/prisma-client";
import { GetUserPermissionUseCase } from "./use-case-get-user-permission-id";
import { GetUserPermissionController } from "./controller-get-user-permission-id";
import { PrismaUserPermissionRepository } from "../../../repositories/in-prisma/user-permission-in-prisma-repository";

export const getUserPermissionFactory = () => {
  const prismaPermissionRepository = new PrismaUserPermissionRepository(prismaClient);
  const getPermissionUseCase = new GetUserPermissionUseCase(prismaPermissionRepository);
  const getPermissionController = new GetUserPermissionController(getPermissionUseCase);

  return getPermissionController;
};
