import prismaClient from "../../../services/prisma-client";
import { CreateImageOrganizationUseCase } from "./use-case-create-image-organization";
import { CreateImageOrganizationController } from "./controller-create-image-organization";
import { PrismaImageRepository } from "../../../repositories/in-prisma/image-in-prisma-repository";

export const createImageOrganizationFactory = () => {
  const prismaImageRepository = new PrismaImageRepository(prismaClient);
  const createImagesOrganizationCase = new CreateImageOrganizationUseCase(prismaImageRepository); 
  const createImageOrganizationController = new CreateImageOrganizationController(createImagesOrganizationCase,prismaImageRepository);

  return createImageOrganizationController;
};
