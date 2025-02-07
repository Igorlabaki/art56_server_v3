
import prismaClient from "../../../service/prisma-client";
import { ListProposalUseCase } from "./use-case-list-proposal";
import { ListProposalController } from "./controller-list-proposal";
import { PrismaVenueRepository } from "../../../repositories/in-prisma/venue-in-prisma-repository";
import { PrismaProposalRepository } from "../../../repositories/in-prisma/proposal-in-prisma-repository";

export const listProposalFactory = (): ListProposalController => {
    const prismaVenueRepository = new PrismaVenueRepository(prismaClient);
    const prismaProposalRepository = new PrismaProposalRepository(prismaClient);
    const listProposalUseCase = new ListProposalUseCase(prismaProposalRepository,prismaVenueRepository);
    const listProposalController = new ListProposalController(listProposalUseCase);

    return listProposalController;
};
