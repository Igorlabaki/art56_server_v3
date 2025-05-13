import prismaClient from "../../../services/prisma-client";
import { CreatePersonUseCase } from "./use-case-create-person";
import { CreatePersonController } from "./controller-create-person";
import { PrismaPersonRepository } from "../../../repositories/in-prisma/person-in-prisma-repository";
import { PrismaProposalRepository } from "../../../repositories/in-prisma/proposal-in-prisma-repository";

export const createPersonFactory = () => {
  const prismaPersonRepository = new PrismaPersonRepository(prismaClient);
  const prismaProposalRepository = new PrismaProposalRepository(prismaClient);
  const createPersonsCase = new CreatePersonUseCase(prismaPersonRepository,prismaProposalRepository); 
  const createPersonController = new CreatePersonController(createPersonsCase);

  return createPersonController;
};
