import { ListUsersUseCase } from "./use-case-list-user";
import prismaClient from "../../../service/prisma-client";
import { ListUserController } from "./controller-list-user";
import { PrismaUserRepository } from "../../../repositories/in-prisma/user-in-prisma-repository";

export const listUserFactory = (): ListUserController => {
    const prismaUserRepository = new PrismaUserRepository(prismaClient);
    const listUserUseCase = new ListUsersUseCase(prismaUserRepository);
    const listUserController = new ListUserController(listUserUseCase);

    return listUserController;
};
