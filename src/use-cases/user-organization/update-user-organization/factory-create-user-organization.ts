import prismaClient from "../../../service/prisma-client";
import { UpdateUserOrganizationUseCase } from "./use-case-update-user-organization";
import { UpdateUserOrganizationController } from "./controller-update-user-organization";
import { PrismaUserOrganizationRepository } from "../../../repositories/in-prisma/user-organization-in-prisma-repository";


export const updateUserOrganizationFactory = () => {
  const prismaUserOrganizationRepository = new PrismaUserOrganizationRepository(prismaClient);
  const updateUserOrganizationsCase = new UpdateUserOrganizationUseCase(prismaUserOrganizationRepository); 
  const updateUserOrganizationController = new UpdateUserOrganizationController(updateUserOrganizationsCase);

  return updateUserOrganizationController;
};
