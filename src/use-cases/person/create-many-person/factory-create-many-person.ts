import prismaClient from "../../../services/prisma-client";
import { CreateManyPersonUseCase } from "./use-case-create-many-person";
import { CreateManyPersonController } from "./controller-create-many-person";
import { PrismaPersonRepository } from "../../../repositories/in-prisma/person-in-prisma-repository";
import { PrismaProposalRepository } from "../../../repositories/in-prisma/proposal-in-prisma-repository";

export const createmanyPersonFactory = () => {
  const prismaPersonRepository = new PrismaPersonRepository(prismaClient);
  const prismaProposalRepository = new PrismaProposalRepository(prismaClient);
  const createmanyPersonsCase = new CreateManyPersonUseCase(prismaPersonRepository,prismaProposalRepository); 
  const createmanyPersonController = new CreateManyPersonController(createmanyPersonsCase);

  return createmanyPersonController;
};
