import prismaClient from "../../../service/prisma-client";
import { CreateSessionUseCase } from "./use-case-create-session";
import { CreateSessionController } from "./controller-create-session";
import { PrismaUserRepository } from "../../../repositories/in-prisma/user-in-prisma-repository";
import { PrismaSessionRepository } from "../../../repositories/in-prisma/session-in-prisma-repository";
import { PrismaRefreshTokenRepository } from "../../../repositories/in-prisma/refresh-token-in-prisma-repository";

export const createSessionFactory = (): CreateSessionController => {
    const prismaUserRepository = new PrismaUserRepository(prismaClient);
    const prismaSessionRepository = new PrismaSessionRepository(prismaClient);
    const prismaRefreshTokenRepository = new PrismaRefreshTokenRepository(prismaClient);
    const createSessionUseCase = new CreateSessionUseCase(prismaUserRepository, prismaSessionRepository, prismaRefreshTokenRepository);
    const createSessionController = new CreateSessionController(createSessionUseCase);

    return createSessionController;
};
