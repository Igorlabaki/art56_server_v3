import prismaClient from "../../../services/prisma-client";
import { PrismaProposalIndicationRepository } from "../../../repositories/in-prisma/proposal-indication-in-prisma-repository";
import { ListProposalIndicationsController } from "./controller-list-proposal-indications";
import { ListProposalIndicationsUseCase } from "./use-case-list-proposal-indications";

export const listProposalIndicationsFactory = () => {
    const useCase = new ListProposalIndicationsUseCase(new PrismaProposalIndicationRepository(prismaClient));
    return new ListProposalIndicationsController(useCase);
};
