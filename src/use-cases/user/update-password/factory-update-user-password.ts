import prismaClient from "../../../service/prisma-client";
import { UpdateUserPasswordCase } from "./use-case-update-user-password";
import { UpdateUserPasswordController } from "./controller-update-user-password";
import { PrismaUserRepository } from "../../../repositories/in-prisma/user-in-prisma-repository";

export const updateUserPasswordFactory = (): UpdateUserPasswordController => {
    const prismaUserRepository = new PrismaUserRepository(prismaClient);
    const updateUserPasswordUseCase = new UpdateUserPasswordCase(prismaUserRepository);
    const updateUserPasswordController = new UpdateUserPasswordController(updateUserPasswordUseCase);

    return updateUserPasswordController;
};
