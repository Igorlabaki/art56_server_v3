
import prismaClient from "../../../service/prisma-client";
import { ListUserOrganizationUseCase } from "./use-case-list-user-organization";

import { ListUserOrganizationController } from "./controller-list-user-organization";
import { PrismaUserRepository } from "../../../repositories/in-prisma/user-in-prisma-repository";
import { PrismaUserOrganizationRepository } from "../../../repositories/in-prisma/user-organization-in-prisma-repository";


export const listUserOrganizationFactory = (): ListUserOrganizationController => {
    const prismaUserRepository = new PrismaUserRepository(prismaClient);
    const prismaUserOrganizationRepository = new PrismaUserOrganizationRepository(prismaClient);
    const listUserOrganizationUseCase = new ListUserOrganizationUseCase(prismaUserOrganizationRepository,prismaUserRepository);
    const listUserOrganizationController = new ListUserOrganizationController(listUserOrganizationUseCase);

    return listUserOrganizationController;
};
