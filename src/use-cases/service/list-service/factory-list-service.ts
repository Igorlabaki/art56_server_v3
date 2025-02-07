import prismaClient from "../../../service/prisma-client";

import { ListServicesUseCase } from "./use-case-list-venue";
import { ListServiceController } from "./controller-list-service";
import { PrismaServiceRepository } from "../../../repositories/in-prisma/service-in-prisma-repository";

export const listServiceFactory = (): ListServiceController => {
    const prismaServiceRepository = new PrismaServiceRepository(prismaClient);
    const listServiceUseCase = new ListServicesUseCase(prismaServiceRepository);
    const listServiceController = new ListServiceController(listServiceUseCase);

    return listServiceController;
};
