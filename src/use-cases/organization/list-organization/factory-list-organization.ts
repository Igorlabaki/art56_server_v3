import prismaClient from "../../../service/prisma-client";
import { ListOrganizationUseCase } from "./use-case-list-organization";
import { ListOrganizationController } from "./controller-list-organization";
import { PrismaUserRepository } from "../../../repositories/in-prisma/user-in-prisma-repository";
import { PrismaOrganizationRepository } from "../../../repositories/in-prisma/organization-in-prisma-repository";

export const listOrganizationFactory = (): ListOrganizationController => {
    const prismaUserRepository = new PrismaUserRepository(prismaClient);
    const prismaOrganizationRepository = new PrismaOrganizationRepository(prismaClient);
    const listOrganizationUseCase = new ListOrganizationUseCase(prismaOrganizationRepository, prismaUserRepository);
    const listOrganizationController = new ListOrganizationController(listOrganizationUseCase);

    return listOrganizationController;
};
