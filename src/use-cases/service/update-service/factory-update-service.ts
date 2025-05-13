import prismaClient from "../../../services/prisma-client";
import { UpdateServiceUseCase } from "./use-case-update-service";
import { UpdateServiceController } from "./controller-update-service";
import { PrismaServiceRepository } from "../../../repositories/in-prisma/service-in-prisma-repository";

export const updateServiceFactory = () => {
  const prismaServiceRepository = new PrismaServiceRepository(prismaClient);
  const updateServiceCase = new UpdateServiceUseCase(prismaServiceRepository);
  const updateServiceController = new UpdateServiceController(updateServiceCase);

  return updateServiceController;
};
