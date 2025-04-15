import prismaClient from "../../../service/prisma-client";
import { ListImagesUseCase } from "./use-case-list-image";
import { ListImageController } from "./controller-list-image";
import { PrismaImageRepository } from "../../../repositories/in-prisma/image-in-prisma-repository";

export const listImageFactory = (): ListImageController => {
    const prismaImageRepository = new PrismaImageRepository(prismaClient);
    const listImageUseCase = new ListImagesUseCase(prismaImageRepository);
    const listImageController = new ListImageController(listImageUseCase);

    return listImageController;
};
