import prismaClient from "../../../services/prisma-client";
import { RegisterUserUseCase } from "./use-case-register-user";
import { RegisterUserController } from "./controller-register-user";
import { PrismaUserRepository } from "../../../repositories/in-prisma/user-in-prisma-repository";
import { PrismaSessionRepository } from "../../../repositories/in-prisma/session-in-prisma-repository";

export const registerUserFactory = (): RegisterUserController => {
    const prismaUserRepository = new PrismaUserRepository(prismaClient);
    const prismaSessionRepository = new PrismaSessionRepository(prismaClient);
    const registerUserUseCase = new RegisterUserUseCase(prismaUserRepository,prismaSessionRepository);
    const registerUserController = new RegisterUserController(registerUserUseCase);

    return registerUserController;
};
