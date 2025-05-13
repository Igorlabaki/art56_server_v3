import prismaClient from "../../../services/prisma-client";

import { PrismaUserRepository } from "../../../repositories/in-prisma/user-in-prisma-repository";
import { PrismaOwnerRepository } from "../../../repositories/in-prisma/owner-in-prisma-repository";
import { ListOwnerController } from "./controller-list-owners";
import { ListOwnerUseCase } from "./use-case-list-owners";
import { PrismaOrganizationRepository } from "../../../repositories/in-prisma/organization-in-prisma-repository";

export const listOwnerFactory = (): ListOwnerController => {
    const prismaOrganizationRepository = new PrismaOrganizationRepository(prismaClient);
    const prismaOwnerRepository = new PrismaOwnerRepository(prismaClient);
    const listOwnerUseCase = new ListOwnerUseCase(prismaOwnerRepository, prismaOrganizationRepository);
    const listOwnerController = new ListOwnerController(listOwnerUseCase);

    return listOwnerController;
};
