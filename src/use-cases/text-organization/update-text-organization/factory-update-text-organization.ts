import { PrismaTextRepository } from "../../../repositories/in-prisma/text-in-prisma-repository";
import prismaClient from "../../../services/prisma-client";
import { UpdateTextOrganizationController } from "./controller-update-text-organization";
import { UpdateTextOrganizationUseCase } from "./use-case-update-text-organization";


export const updateTextOrganizationFactory = () => {
  const prismaTextRepository = new PrismaTextRepository(prismaClient);
  const updateTextOrganizationCase = new UpdateTextOrganizationUseCase(prismaTextRepository);
  const updateTextOrganizationController = new UpdateTextOrganizationController(updateTextOrganizationCase);

  return updateTextOrganizationController;
};
