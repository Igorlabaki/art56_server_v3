import prismaClient from "../../../services/prisma-client";
import { UpdateContractUseCase } from "./use-case-update-contract";
import { UpdateContractController } from "./controller-update-contract";
import { PrismaContractRepository } from "../../../repositories/in-prisma/contract-in-prisma-repository";

export const updateContractFactory = () => {
  const prismaContractRepository = new PrismaContractRepository(prismaClient);
  const updateContractCase = new UpdateContractUseCase(prismaContractRepository);
  const updateContractController = new UpdateContractController(updateContractCase);

  return updateContractController;
};
