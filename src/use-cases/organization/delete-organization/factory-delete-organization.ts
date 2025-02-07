import prismaClient from "../../../service/prisma-client";
import { DeleteOrganizationUseCase } from "./use-case-delete-organization";
import { DeleteOrganizationController } from "./controller-delete-organization";
import { PrismaOrganizationRepository } from "../../../repositories/in-prisma/organization-in-prisma-repository";

export const deleteOrganizationFactory = () => {
  const prismaOrganizationRepository = new PrismaOrganizationRepository(prismaClient);
  const deleteOrganizationCase = new DeleteOrganizationUseCase(prismaOrganizationRepository);
  const deleteOrganizationController = new DeleteOrganizationController(deleteOrganizationCase);

  return deleteOrganizationController;
};
