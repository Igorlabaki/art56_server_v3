
import prismaClient from "../../../services/prisma-client"; 
import { ListUserOrganizationPermissionUseCase } from "./use-case-list-user-organization-permission";
import { ListUserOrganizationPermissionController } from "./controller-list-user-organization-permission";
import { PrismaUserOrganizationPermissionRepository } from "../../../repositories/in-prisma/user-organization-permission-in-prisma-repository";

export const listUserOrganizationPermissionFactory = (): ListUserOrganizationPermissionController => {
    const prismaUserOrganizationPermissionRepository = new PrismaUserOrganizationPermissionRepository(prismaClient);
    const prismaUserOrganizationPermissionRepository2 = new PrismaUserOrganizationPermissionRepository(prismaClient);
    const listUserOrganizationPermissionUseCase = new ListUserOrganizationPermissionUseCase(prismaUserOrganizationPermissionRepository, prismaUserOrganizationPermissionRepository2);
            const listUserOrganizationPermissionController = new ListUserOrganizationPermissionController(listUserOrganizationPermissionUseCase);

    return listUserOrganizationPermissionController;
};
