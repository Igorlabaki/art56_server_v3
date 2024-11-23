import prismaClient from "../../../service/prisma-client";
import { CreateServiceUseCase } from "./use-case-create-service";
import { CreateServiceController } from "./controller-create-service";
import { PrismaServiceRepository } from "../../../repositories/in-prisma/service-in-prisma-repository";

export const createServiceFactory = (): CreateServiceController => {
    const prismaServiceRepository = new PrismaServiceRepository(prismaClient);
    const createServiceUseCase = new CreateServiceUseCase(prismaServiceRepository);
    const createServiceController = new CreateServiceController(createServiceUseCase);

    return createServiceController;
};
