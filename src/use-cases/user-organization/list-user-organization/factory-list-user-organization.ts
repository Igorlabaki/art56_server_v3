
import prismaClient from "../../../service/prisma-client";
import { ListUserOrganizationUseCase } from "./use-case-list-user-organization";
import { ListUserOrganizationController } from "./controller-list-user-organization";
import { PrismaOrganizationRepository } from "../../../repositories/in-prisma/organization-in-prisma-repository";
import { PrismaUserOrganizationRepository } from "../../../repositories/in-prisma/user-organization-in-prisma-repository";


export const listUserOrganizationFactory = (): ListUserOrganizationController => {
    const prismaOrganizationRepository = new PrismaOrganizationRepository(prismaClient);
    const prismaUserOrganizationRepository = new PrismaUserOrganizationRepository(prismaClient);
    const listUserOrganizationUseCase = new ListUserOrganizationUseCase(prismaUserOrganizationRepository,prismaOrganizationRepository);
    const listUserOrganizationController = new ListUserOrganizationController(listUserOrganizationUseCase);

    return listUserOrganizationController;
};
