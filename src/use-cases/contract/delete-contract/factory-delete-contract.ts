import prismaClient from "../../../service/prisma-client";
import { DeleteContractUseCase } from "./use-case-delete-contract";
import { DeleteContractController } from "./controller-delete-contract";
import { PrismaContractRepository } from "../../../repositories/in-prisma/contract-in-prisma-repository";

export const deleteContractFactory = () => {
  const prismaContractRepository = new PrismaContractRepository(prismaClient);
  const deleteContractCase = new DeleteContractUseCase(prismaContractRepository);
  const deleteContractController = new DeleteContractController(deleteContractCase);

  return deleteContractController;
};
