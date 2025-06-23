import prismaClient from "../../../services/prisma-client";
import { ListImagesOrganizationUseCase } from "./use-case-list-image-organization";
import { ListImageController } from "./controller-list-image-organization";
import { PrismaImageRepository } from "../../../repositories/in-prisma/image-in-prisma-repository";

export const listImageOrganizationFactory = (): ListImageController => {
    const prismaImageRepository = new PrismaImageRepository(prismaClient);
    const listImageOrganizationUseCase = new ListImagesOrganizationUseCase(prismaImageRepository);
    const listImageOrganizationController = new ListImageController(listImageOrganizationUseCase);

    return listImageOrganizationController;
};
