import prismaClient from "../../../service/prisma-client";
import { DeleteProposalByIdUseCase } from "./use-case-get-delete-proposal";
import { DeleteProposalByIdController } from "./controller-delete-proposal";
import { PrismaProposalRepository } from "../../../repositories/in-prisma/proposal-in-prisma-repository";

export const deleteProposalByidFactory = () => {
  const prismaProposalRepository = new PrismaProposalRepository(prismaClient);
  const deleteProposalByidUseCase = new DeleteProposalByIdUseCase(prismaProposalRepository);
  const deleteProposalByidController = new DeleteProposalByIdController(deleteProposalByidUseCase);

  return deleteProposalByidController;
};
