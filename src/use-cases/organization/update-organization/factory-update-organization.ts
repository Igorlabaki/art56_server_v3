import prismaClient from "../../../services/prisma-client";
import { UpdateOrganizationUseCase } from "./use-case-update-organization";
import { UpdateOrganizationController } from "./controller-update-organization";
import { PrismaOrganizationRepository } from "../../../repositories/in-prisma/organization-in-prisma-repository";

export const updateOrganizationFactory = () => {
  const prismaOrganizationRepository = new PrismaOrganizationRepository(prismaClient);
  const updateOrganizationCase = new UpdateOrganizationUseCase(prismaOrganizationRepository);
  const updateOrganizationController = new UpdateOrganizationController(updateOrganizationCase);

  return updateOrganizationController;
};
