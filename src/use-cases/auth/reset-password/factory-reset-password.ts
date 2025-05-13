import prismaClient from "../../../services/prisma-client";
import { PrismaUserRepository } from "../../../repositories/in-prisma/user-in-prisma-repository";
import { ResetPasswordUseCase } from "./use-case-reset-password";
import { ResetPasswordController } from "./controller-reset-password";

export const resetPasswordFactory = (): ResetPasswordController => {
    const prismaUserRepository = new PrismaUserRepository(prismaClient);
    const resetPasswordUseCase = new ResetPasswordUseCase(prismaUserRepository);
    const resetPasswordController = new ResetPasswordController(resetPasswordUseCase);

    return resetPasswordController;
};
