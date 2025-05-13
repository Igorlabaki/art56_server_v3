import prismaClient from "../../../services/prisma-client";
import { UpdateProposalPersonalInfoUseCase } from "./use-case-update-proposal-personal-info";
import { UpdateProposalPersonalInfoController } from "./controller-update-proposal-personal-info";
import { PrismaProposalRepository } from "../../../repositories/in-prisma/proposal-in-prisma-repository";

export const updateProposalPersonalInfoFactory = () => {
  const prismaProposalRepository = new PrismaProposalRepository(prismaClient);
  const updateProposalUseCase = new UpdateProposalPersonalInfoUseCase(prismaProposalRepository);
  const updateProposalPersonalInfoController = new UpdateProposalPersonalInfoController(updateProposalUseCase);

  return updateProposalPersonalInfoController;
};
