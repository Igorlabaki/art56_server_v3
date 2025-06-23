import { PrismaImageRepository } from "../../../repositories/in-prisma/image-in-prisma-repository";
import prismaClient from "../../../services/prisma-client";
import { ListImageOrganizationController } from "./controller-list-image-organization";
import { ListImagesOrganizationUseCase } from "./use-case-list-image-organization";


export const listImageOrganizationFactory = (): ListImageOrganizationController => {
    const prismaImageRepository = new PrismaImageRepository(prismaClient);
    const listImageOrganizationUseCase = new ListImagesOrganizationUseCase(prismaImageRepository);
    const listImageOrganizationController = new ListImageOrganizationController(listImageOrganizationUseCase);

    return listImageOrganizationController;
};
