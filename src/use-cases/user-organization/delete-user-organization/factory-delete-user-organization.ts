import prismaClient from "../../../service/prisma-client";
import { DeleteUserOrganizationUseCase } from "./use-case-delete-user-organization";
import { DeleteUserOrganizationController } from "./controller-delete-user-organization";
import { PrismaUserOrganizationRepository } from "../../../repositories/in-prisma/user-organization-in-prisma-repository";

export const deleteUserOrganizationFactory = () => {
  const prismaUserOrganizationRepository = new PrismaUserOrganizationRepository(prismaClient);
  const deleteUserOrganizationCase = new DeleteUserOrganizationUseCase(prismaUserOrganizationRepository);
  const deleteUserOrganizationController = new DeleteUserOrganizationController(deleteUserOrganizationCase);

  return deleteUserOrganizationController;
};
