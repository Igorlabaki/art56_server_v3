import prismaClient from "../../../service/prisma-client";

import { GetOrganizationByIdUseCase } from "./use-case-get-organization-by-id";
import { GetOrganizationByIdController } from "./controller-get-organization-by-id";
import { PrismaOrganizationRepository } from "../../../repositories/in-prisma/organization-in-prisma-repository";

export const getOrganizationByidFactory = () => {
  const prismaOrganizationRepository = new PrismaOrganizationRepository(prismaClient);
  const getOrganizationByidUseCase = new GetOrganizationByIdUseCase(prismaOrganizationRepository);
  const getOrganizationByidController = new GetOrganizationByIdController(getOrganizationByidUseCase);

  return getOrganizationByidController;
};
