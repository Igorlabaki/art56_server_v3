import prismaClient from "../../../service/prisma-client";
import { ListPersonsUseCase } from "./use-case-list-person";
import { ListPersonController } from "./controller-list-person";
import { PrismaPersonRepository } from "../../../repositories/in-prisma/person-in-prisma-repository";

export const listPersonFactory = (): ListPersonController => {
    const prismaPersonRepository = new PrismaPersonRepository(prismaClient);
    const listPersonUseCase = new ListPersonsUseCase(prismaPersonRepository);
    const listPersonController = new ListPersonController(listPersonUseCase);

    return listPersonController;
};
