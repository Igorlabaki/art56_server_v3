import prismaClient from "../../../service/prisma-client";
import { CreateOwnerUseCase } from "./use-case-create-owner";
import { CreateOwnerController } from "./controller-create-owner";
import { PrismaOwnerRepository } from "../../../repositories/in-prisma/owner-in-prisma-repository";


export const createOwnerFactory = (): CreateOwnerController => {
    const prismaOwnerRepository = new PrismaOwnerRepository(prismaClient);
    const createOwnerUseCase = new CreateOwnerUseCase(prismaOwnerRepository);
    const createOwnerController = new CreateOwnerController(createOwnerUseCase);

    return createOwnerController;
};
