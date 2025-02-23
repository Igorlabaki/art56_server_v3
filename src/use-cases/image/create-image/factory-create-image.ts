import prismaClient from "../../../service/prisma-client";
import { CreateImageUseCase } from "./use-case-create-image";
import { CreateImageController } from "./controller-create-image";
import { PrismaImageRepository } from "../../../repositories/in-prisma/image-in-prisma-repository";

export const createImageFactory = () => {
  const prismaImageRepository = new PrismaImageRepository(prismaClient);
  const createImagesCase = new CreateImageUseCase(prismaImageRepository); 
  const createImageController = new CreateImageController(createImagesCase,prismaImageRepository);

  return createImageController;
};
