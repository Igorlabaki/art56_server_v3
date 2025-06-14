
import prismaClient from "../../../services/prisma-client";

import { PrismaTextRepository } from "../../../repositories/in-prisma/text-in-prisma-repository";
import { ListTextOrganizationController } from "./controller-list-text-organization";
import { ListTextOrganizationUseCase } from "./use-case-list-text-organization";

export const listTextFactory = (): ListTextOrganizationController => {
    const prismaTextRepository = new PrismaTextRepository(prismaClient);
    const listTextUseCase = new ListTextOrganizationUseCase(prismaTextRepository);
    const listTextController = new ListTextOrganizationController(listTextUseCase);

    return listTextController;
};
