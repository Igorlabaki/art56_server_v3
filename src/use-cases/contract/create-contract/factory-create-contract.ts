import prismaClient from "../../../service/prisma-client";
import { CreateContractUseCase } from "./use-case-create-contract";
import { CreateContractController } from "./controller-create-contract";
import { PrismaContractRepository } from "../../../repositories/in-prisma/contract-in-prisma-repository";

export const createContractFactory = () => {
  const prismaContractRepository = new PrismaContractRepository(prismaClient);
  const createContractsCase = new CreateContractUseCase(prismaContractRepository); 
  const createContractController = new CreateContractController(createContractsCase);

  return createContractController;
};
