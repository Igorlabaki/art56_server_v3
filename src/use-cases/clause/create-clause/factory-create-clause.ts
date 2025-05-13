import prismaClient from "../../../services/prisma-client";
import { CreateClauseUseCase } from "./use-case-create-clause";
import { CreateClauseController } from "./controller-create-clause";
import { PrismaClauseRepository } from "../../../repositories/in-prisma/clause-in-prisma-repository";

export const createClauseFactory = () => {
  const prismaClauseRepository = new PrismaClauseRepository(prismaClient);
  const createClausesCase = new CreateClauseUseCase(prismaClauseRepository); 
  const createClauseController = new CreateClauseController(createClausesCase);

  return createClauseController;
};
