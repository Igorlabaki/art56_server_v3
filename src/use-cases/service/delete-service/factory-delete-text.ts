import prismaClient from "../../../services/prisma-client";
import { DeleteServiceUseCase } from "./use-case-delete-service";
import { DeleteServiceController } from "./controller-delete-text";
import { PrismaServiceRepository } from "../../../repositories/in-prisma/service-in-prisma-repository";

export const deleteServiceFactory = () => {
  const prismaServiceRepository = new PrismaServiceRepository(prismaClient);
  const deleteServiceCase = new DeleteServiceUseCase(prismaServiceRepository);
  const deleteServiceController = new DeleteServiceController(deleteServiceCase);

  return deleteServiceController;
};
