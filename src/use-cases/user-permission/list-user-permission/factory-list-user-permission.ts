
import prismaClient from "../../../service/prisma-client";
import { ListUserPermissionUseCase } from "./use-case-list-user-permission";
import { ListUserPermissionController } from "./controller-list-user-permission";
import { PrismaUserPermissionRepository } from "../../../repositories/in-prisma/user-permission-in-prisma-repository";

export const listUserPermissionFactory = (): ListUserPermissionController => {
    const prismaPermissionRepository = new PrismaUserPermissionRepository(prismaClient);
    const prismaUserPermissionRepository = new PrismaUserPermissionRepository(prismaClient);
    const listUserPermissionUseCase = new ListUserPermissionUseCase(prismaUserPermissionRepository, prismaPermissionRepository);
    const listUserPermissionController = new ListUserPermissionController(listUserPermissionUseCase);

    return listUserPermissionController;
};
