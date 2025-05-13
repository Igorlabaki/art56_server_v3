import prismaClient from "../../../services/prisma-client";

import { AuthenticateUserUseCase } from "./use-case-authenticate-user";
import { AuthenticateUserController } from "./controller-authenticate-user";
import { PrismaUserRepository } from "../../../repositories/in-prisma/user-in-prisma-repository";
import { PrismaSessionRepository } from "../../../repositories/in-prisma/session-in-prisma-repository";

export const authenticateUserFactory = (): AuthenticateUserController => {
    const prismaUserRepository = new PrismaUserRepository(prismaClient);
    const prismaSessionRepository = new PrismaSessionRepository(prismaClient);
    const authenticateUserUseCase = new AuthenticateUserUseCase(prismaUserRepository,prismaSessionRepository);
    const authenticateUserController = new AuthenticateUserController(authenticateUserUseCase);

    return authenticateUserController;
};
