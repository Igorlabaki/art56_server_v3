import prismaClient from "../../../services/prisma-client";
import { GetByTagImagesUseCase } from "./use-case-get-by-tag-image";
import { GetByTagImageController } from "./controller-get-by-tag-image";
import { PrismaImageRepository } from "../../../repositories/in-prisma/image-in-prisma-repository";

export const getbytagImageFactory = (): GetByTagImageController => {
    const prismaImageRepository = new PrismaImageRepository(prismaClient);
    const getbytagImageUseCase = new GetByTagImagesUseCase(prismaImageRepository);
    const getbytagImageController = new GetByTagImageController(getbytagImageUseCase);

    return getbytagImageController;
};
