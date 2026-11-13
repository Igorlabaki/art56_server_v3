import prismaClient from "../../../services/prisma-client";

import { PrismaOwnerRepository } from "../../../repositories/in-prisma/owner-in-prisma-repository";
import { ListOwnerController } from "./controller-list-owners";
import { ListOwnerUseCase } from "./use-case-list-owners";
import { ownerAuthorizerFactory } from "../factory-owner-authorizer";

export const listOwnerFactory = (): ListOwnerController => {
    const prismaOwnerRepository = new PrismaOwnerRepository(prismaClient);
    const listOwnerUseCase = new ListOwnerUseCase(prismaOwnerRepository, ownerAuthorizerFactory());
    const listOwnerController = new ListOwnerController(listOwnerUseCase);

    return listOwnerController;
};
