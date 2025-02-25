import prismaClient from "../../../service/prisma-client";
import { ListClausesUseCase } from "./use-case-list-clause";
import { ListClauseController } from "./controller-list-clause";
import { PrismaClauseRepository } from "../../../repositories/in-prisma/clause-in-prisma-repository";

export const listClauseFactory = (): ListClauseController => {
    const prismaClauseRepository = new PrismaClauseRepository(prismaClient);
    const listClauseUseCase = new ListClausesUseCase(prismaClauseRepository);
    const listClauseController = new ListClauseController(listClauseUseCase);

    return listClauseController;
};
