import { PrismaRefreshTokenRepository } from "../../repositories/in-prisma/refresh-token-in-prisma-repository";
import { PrismaSessionRepository } from "../../repositories/in-prisma/session-in-prisma-repository";
import { PrismaUserRepository } from "../../repositories/in-prisma/user-in-prisma-repository";
import prismaClient from "../../services/prisma-client";
import { RefreshTokenController } from "./controller-refresh-token";
import { RefreshTokenUseCase } from "./use-case-refresh-token";

export const refreshTokenFactory = (): RefreshTokenController => {
    const prismaTokenRepository = new PrismaRefreshTokenRepository(prismaClient);
    const prismaSessionRepository = new PrismaSessionRepository(prismaClient);
    const refreshTokenUseCase = new RefreshTokenUseCase(prismaTokenRepository,prismaSessionRepository);
    const refreshTokenController = new RefreshTokenController(refreshTokenUseCase);

    return refreshTokenController;
};
