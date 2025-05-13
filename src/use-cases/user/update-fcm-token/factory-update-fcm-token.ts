import prismaClient from "../../../services/prisma-client";
import { UpdateFcmTokenUseCase } from "./use-case-update-fcm-token";
import { UpdateFcmTokenController } from "./controller-update-fcm-token";
import { PrismaUserRepository } from "../../../repositories/in-prisma/user-in-prisma-repository";

export const updateFcmTokenFactory = (): UpdateFcmTokenController => {
    const prismaUserRepository = new PrismaUserRepository(prismaClient);
    const updateFcmTokenUseCase = new UpdateFcmTokenUseCase(prismaUserRepository);
    const updateFcmTokenController = new UpdateFcmTokenController(updateFcmTokenUseCase);

    return updateFcmTokenController;
}; 