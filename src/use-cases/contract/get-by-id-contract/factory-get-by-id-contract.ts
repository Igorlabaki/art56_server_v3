import prismaClient from "../../../service/prisma-client";
import { GetContractByIdUseCase } from "./use-case-get-by-id-contract";
import { GetContractByIdController } from "./controller-get-by-id-contract";
import { PrismaContractRepository } from "../../../repositories/in-prisma/contract-in-prisma-repository";

export const getContractbyidFactory = () => {
  const prismaContractRepository = new PrismaContractRepository(prismaClient);
  const getcontractbyidCase = new GetContractByIdUseCase(prismaContractRepository);
  const getcontractbyidController = new GetContractByIdController(getcontractbyidCase);

  return getcontractbyidController;
};
