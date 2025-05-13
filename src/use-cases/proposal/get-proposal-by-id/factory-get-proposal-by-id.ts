import prismaClient from "../../../services/prisma-client";

import { GetProposalByIdUseCase } from "./use-case-get-proposal-by-id";
import { GetProposalByIdController } from "./controller-get-proposal-by-id";
import { PrismaProposalRepository } from "../../../repositories/in-prisma/proposal-in-prisma-repository";

export const getProposalByidFactory = () => {
  const prismaProposalRepository = new PrismaProposalRepository(prismaClient);
  const getProposalByidUseCase = new GetProposalByIdUseCase(prismaProposalRepository);
  const getProposalByidController = new GetProposalByIdController(getProposalByidUseCase);

  return getProposalByidController;
};
