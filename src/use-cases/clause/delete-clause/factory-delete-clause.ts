import prismaClient from "../../../service/prisma-client";
import { DeleteClauseUseCase } from "./use-case-delete-clause";
import { DeleteClauseController } from "./controller-delete-clause";
import { PrismaClauseRepository } from "../../../repositories/in-prisma/clause-in-prisma-repository";

export const deleteClauseFactory = () => {
  const prismaClauseRepository = new PrismaClauseRepository(prismaClient);
  const deleteClauseCase = new DeleteClauseUseCase(prismaClauseRepository);
  const deleteClauseController = new DeleteClauseController(deleteClauseCase);

  return deleteClauseController;
};
