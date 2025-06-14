import prismaClient from "../../../services/prisma-client";

import { PrismaTextRepository } from "../../../repositories/in-prisma/text-in-prisma-repository";
import { CreateTextOrganizationUseCase } from "./use-case-create-text-organization";
import { CreateTextOrganizationController } from "./controller-create-text-organization";

export const createTextOrganizationFactory = () => {
  const prismaTextRepository = new PrismaTextRepository(prismaClient);
  const createTextOrganizationsCase = new CreateTextOrganizationUseCase(prismaTextRepository); 
  const createTextOrganizationController = new CreateTextOrganizationController(createTextOrganizationsCase);

  return createTextOrganizationController;
};
