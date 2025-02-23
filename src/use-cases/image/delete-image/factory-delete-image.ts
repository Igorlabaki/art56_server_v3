import prismaClient from "../../../service/prisma-client";
import { DeleteImageUseCase } from "./use-case-delete-image";
import { DeleteImageController } from "./controller-delete-image";
import { PrismaImageRepository } from "../../../repositories/in-prisma/image-in-prisma-repository";

export const deleteImageFactory = () => {
  const prismaImageRepository = new PrismaImageRepository(prismaClient);
  const deleteImageCase = new DeleteImageUseCase(prismaImageRepository);
  const deleteImageController = new DeleteImageController(deleteImageCase);

  return deleteImageController;
};
