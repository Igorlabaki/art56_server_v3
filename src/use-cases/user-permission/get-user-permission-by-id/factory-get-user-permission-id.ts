import prismaClient from "../../../service/prisma-client";
import { GetUserPermissionByIdUseCase } from "./use-case-get-user-permission-id";
import { GetUserPermissionByIdController } from "./controller-get-user-permission-id";
import { PrismaUserPermissionRepository } from "../../../repositories/in-prisma/user-permission-in-prisma-repository";

export const getUserPermissionByidFactory = () => {
  const prismaPermissionRepository = new PrismaUserPermissionRepository(prismaClient);
  const getPermissionByidUseCase = new GetUserPermissionByIdUseCase(prismaPermissionRepository);
  const getPermissionByidController = new GetUserPermissionByIdController(getPermissionByidUseCase);

  return getPermissionByidController;
};
