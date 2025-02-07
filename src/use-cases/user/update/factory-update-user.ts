import prismaClient from "../../../service/prisma-client";
import { UpdateUserCase } from "./use-case-update-user";
import { UpdateUserController } from "./controller-update-user";
import { PrismaUserRepository } from "../../../repositories/in-prisma/user-in-prisma-repository";

export const updateUserFactory = (): UpdateUserController => {
    const prismaUserRepository = new PrismaUserRepository(prismaClient);
    const updateUserUseCase = new UpdateUserCase(prismaUserRepository);
    const updateUserController = new UpdateUserController(updateUserUseCase);

    return updateUserController;
};
