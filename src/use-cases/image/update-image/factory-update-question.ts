import prismaClient from "../../../services/prisma-client";
import { UpdateImageUseCase } from "./use-case-update-image";
import { UpdateImageController } from "./controller-update-image";
import { PrismaImageRepository } from "../../../repositories/in-prisma/image-in-prisma-repository";

export const updateImageFactory = () => {
  const prismaImageRepository = new PrismaImageRepository(prismaClient);
  const updateImageCase = new UpdateImageUseCase(prismaImageRepository);
  const updateImageController = new UpdateImageController(updateImageCase,prismaImageRepository);

  return updateImageController;
};
