import prismaClient from "../../../service/prisma-client";
import { GetUserOrganizationByIdUseCase } from "./use-case-get-user-organization-by-id";
import { GetUserOrganizationByIdController } from "./controller-get-user-organization-by-id";
import { PrismaUserOrganizationRepository } from "../../../repositories/in-prisma/user-organization-in-prisma-repository";

export const getUserOrganizationByidFactory = () => {
  const prismaOrganizationRepository = new PrismaUserOrganizationRepository(prismaClient);
  const getOrganizationByidUseCase = new GetUserOrganizationByIdUseCase(prismaOrganizationRepository);
  const getOrganizationByidController = new GetUserOrganizationByIdController(getOrganizationByidUseCase);

  return getOrganizationByidController;
};
