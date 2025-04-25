import prismaClient from "../../../service/prisma-client";
import { RegisterGoogleUserUseCase } from "./use-case-register-google-user";
import { RegisterGoogleUserController } from "./controller-register-google-user";
import { PrismaUserRepository } from "../../../repositories/in-prisma/user-in-prisma-repository";
import { PrismaSessionRepository } from "../../../repositories/in-prisma/session-in-prisma-repository";

export const registerGoogleUserFactory = (): RegisterGoogleUserController => {
    const prismaUserRepository = new PrismaUserRepository(prismaClient);
    const prismaSessionRepository = new PrismaSessionRepository(prismaClient);
    const registerGoogleUserUseCase = new RegisterGoogleUserUseCase(prismaUserRepository,prismaSessionRepository);
    const registerGoogleUserController = new RegisterGoogleUserController(registerGoogleUserUseCase);

    return registerGoogleUserController;
};
