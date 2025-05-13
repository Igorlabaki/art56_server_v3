import prismaClient from "../../../services/prisma-client";
import { PrismaUserRepository } from "../../../repositories/in-prisma/user-in-prisma-repository";
import { ForgotPasswordUseCase } from "./use-case-forgot-password";
import { ForgotPasswordController } from "./controller-forgot-password";

export const forgotPasswordFactory = (): ForgotPasswordController => {
    const prismaUserRepository = new PrismaUserRepository(prismaClient);
    const forgotPasswordUseCase = new ForgotPasswordUseCase(prismaUserRepository);
    const forgotPasswordController = new ForgotPasswordController(forgotPasswordUseCase);

    return forgotPasswordController;
};
