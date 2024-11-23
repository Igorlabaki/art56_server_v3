import prismaClient from "../../../service/prisma-client";

import { PrismaUserRepository } from "../../../repositories/in-prisma/user-in-prisma-repository";
import { PrismaOrganizationRepository } from "../../../repositories/in-prisma/organization-in-prisma-repository";
import { PrismaRefreshTokenRepository } from "../../../repositories/in-prisma/refresh-token-in-prisma-repository";
import { CreateOrganizationController } from "./controller-create-organization";
import { CreateOrganizationUseCase } from "./use-case-create-organization";
import { PrismaUserOrganizationRepository } from "../../../repositories/in-prisma/user-organization-in-prisma-repository";

export const createOrganizationFactory = (): CreateOrganizationController => {
    const prismaOrganizationRepository = new PrismaOrganizationRepository(prismaClient);
    const prismaUserOrganizationRepository = new PrismaUserOrganizationRepository(prismaClient);
    const createOrganizationUseCase = new CreateOrganizationUseCase(prismaOrganizationRepository,prismaUserOrganizationRepository);
    const createOrganizationController = new CreateOrganizationController(createOrganizationUseCase);

    return createOrganizationController;
};
