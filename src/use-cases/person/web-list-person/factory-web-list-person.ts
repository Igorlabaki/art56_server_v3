import prismaClient from "../../../services/prisma-client";
import { ListWebPersonsUseCase } from "./use-case-web-list-person";
import { ListWebPersonController } from "./controller-web-list-person";
import { PrismaPersonRepository } from "../../../repositories/in-prisma/person-in-prisma-repository";
import { PrismaProposalRepository } from "../../../repositories/in-prisma/proposal-in-prisma-repository";

export const listWebPersonFactory = (): ListWebPersonController => {
    const prismaPersonRepository = new PrismaPersonRepository(prismaClient);
    const prismaProposalRepository = new PrismaProposalRepository(prismaClient);
    const listPersonUseCase = new ListWebPersonsUseCase(prismaPersonRepository,prismaProposalRepository);
    const listPersonController = new ListWebPersonController(listPersonUseCase);

    return listPersonController;
};
