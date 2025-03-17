import prismaClient from "../../../service/prisma-client";
import { CreateUserOrganizationUseCase } from "./use-case-create-user-organization";
import { CreateUserOrganizationController } from "./controller-create-user-organization";
import { PrismaUserOrganizationRepository } from "../../../repositories/in-prisma/user-organization-in-prisma-repository";


export const createUserOrganizationFactory = () => {
  const prismaUserOrganizationRepository = new PrismaUserOrganizationRepository(prismaClient);
  const createUserOrganizationsCase = new CreateUserOrganizationUseCase(prismaUserOrganizationRepository); 
  const createUserOrganizationController = new CreateUserOrganizationController(createUserOrganizationsCase);

  return createUserOrganizationController;
};
