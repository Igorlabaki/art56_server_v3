import prismaClient from "../../../services/prisma-client";
import { UpdateImageOrganizationUseCase } from "./use-case-update-image-organization";
import {  UpdateImageOrganizationController } from "./controller-update-image-organization";
import { PrismaImageRepository } from "../../../repositories/in-prisma/image-in-prisma-repository";

export const updateImageOrganizationFactory = () => {
  const prismaImageRepository = new PrismaImageRepository(prismaClient);
  const updateImageOrganizationCase = new UpdateImageOrganizationUseCase(prismaImageRepository);
  const updateImageOrganizationController = new UpdateImageOrganizationController(updateImageOrganizationCase,prismaImageRepository);

  return updateImageOrganizationController;
};
