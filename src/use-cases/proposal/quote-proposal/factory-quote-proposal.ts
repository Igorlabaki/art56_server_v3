import prismaClient from "../../../services/prisma-client";
import { PrismaVenueRepository } from "../../../repositories/in-prisma/venue-in-prisma-repository";
import { PrismaServiceRepository } from "../../../repositories/in-prisma/service-in-prisma-repository";
import { PrismaProposalRepository } from "../../../repositories/in-prisma/proposal-in-prisma-repository";
import { PrismaGoalRepository } from "../../../repositories/in-prisma/goal-in-prisma-repository";
import { PrismaUserVenuePermissionRepository } from "../../../repositories/in-prisma/user-venue-permission-in-prisma-repository";
import { ProposalQuoteAuthorizer } from "../proposal-quote-authorizer";
import { QuoteProposalUseCase } from "./use-case-quote-proposal";
import { QuoteProposalController } from "./controller-quote-proposal";

export const quoteProposalFactory = () => {
    const authorizer = new ProposalQuoteAuthorizer(
        new PrismaVenueRepository(prismaClient),
        new PrismaUserVenuePermissionRepository(prismaClient),
    );
    const useCase = new QuoteProposalUseCase(
        authorizer,
        new PrismaServiceRepository(prismaClient),
        new PrismaProposalRepository(prismaClient),
        new PrismaGoalRepository(prismaClient),
    );
    return new QuoteProposalController(useCase);
};
