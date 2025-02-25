import prismaClient from "../../../service/prisma-client";
import { UpdateClauseUseCase } from "./use-case-update-clause";
import { UpdateClauseController } from "./controller-update-clause";
import { PrismaClauseRepository } from "../../../repositories/in-prisma/clause-in-prisma-repository";

export const updateClauseFactory = () => {
  const prismaClauseRepository = new PrismaClauseRepository(prismaClient);
  const updateClauseCase = new UpdateClauseUseCase(prismaClauseRepository);
  const updateClauseController = new UpdateClauseController(updateClauseCase);

  return updateClauseController;
};
