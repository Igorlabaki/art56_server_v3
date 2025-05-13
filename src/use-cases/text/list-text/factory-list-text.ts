import { ListTextsUseCase } from "./use-case-list-text";
import prismaClient from "../../../services/prisma-client";
import { ListTextController } from "./controller-list-text";
import { PrismaTextRepository } from "../../../repositories/in-prisma/text-in-prisma-repository";

export const listTextFactory = (): ListTextController => {
    const prismaTextRepository = new PrismaTextRepository(prismaClient);
    const listTextUseCase = new ListTextsUseCase(prismaTextRepository);
    const listTextController = new ListTextController(listTextUseCase);

    return listTextController;
};
