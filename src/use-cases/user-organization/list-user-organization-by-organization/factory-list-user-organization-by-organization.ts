import prismaClient from "../../../service/prisma-client";
import { ListUserOrganizationByOrganizationUseCase } from "./use-case-list-user-organization-by-organization";
import { PrismaOrganizationRepository } from "../../../repositories/in-prisma/organization-in-prisma-repository";
import { ListUserOrganizationByOrganizationController } from "./controller-list-user-organization-by-organization";
import { PrismaUserOrganizationRepository } from "../../../repositories/in-prisma/user-organization-in-prisma-repository";

export const listUserOrganizationByOrganizationFactory = () : ListUserOrganizationByOrganizationController => {
    const prismaOrganizationRepository = new PrismaOrganizationRepository(prismaClient);
    const prismaUserOrganizationByOrgaznitionRepository = new PrismaUserOrganizationRepository(prismaClient);
    const listUserOrganizationByOrgaznitionUseCase = new ListUserOrganizationByOrganizationUseCase(prismaUserOrganizationByOrgaznitionRepository,prismaOrganizationRepository);
    const listUserOrganizationByOrgaznitionController = new ListUserOrganizationByOrganizationController(listUserOrganizationByOrgaznitionUseCase);

    return listUserOrganizationByOrgaznitionController;
};
