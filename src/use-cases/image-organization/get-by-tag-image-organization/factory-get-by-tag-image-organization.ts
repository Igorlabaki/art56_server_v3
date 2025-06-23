import prismaClient from "../../../services/prisma-client";
import { GetByTagImagesOrganizationUseCase } from "./use-case-get-by-tag-image-organization";
import { GetByTagImageOrganizationController } from "./controller-get-by-tag-image-organization";
import { PrismaImageRepository } from "../../../repositories/in-prisma/image-in-prisma-repository";

export const getbytagImageOrganizationFactory = (): GetByTagImageOrganizationController => {
    const prismaImageRepository = new PrismaImageRepository(prismaClient);
    const getbytagImageOrganizationUseCase = new GetByTagImagesOrganizationUseCase(prismaImageRepository);
    const getbytagImageOrganizationController = new GetByTagImageOrganizationController(getbytagImageOrganizationUseCase);

    return getbytagImageOrganizationController;
};
