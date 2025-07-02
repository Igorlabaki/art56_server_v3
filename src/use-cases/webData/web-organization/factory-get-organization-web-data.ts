import prismaClient from "../../../services/prisma-client";
import { GetOrganzationWebDataUseCase } from "./use-case-get-web-organizationdata";
import { GetOrganziationWebDataController } from "./controller-get-organization-web-data";
import { PrismaOrganizationRepository } from "../../../repositories/in-prisma/organization-in-prisma-repository";



export const getOrganizationWebDataFactory = () => {
  const prismaOrganizationRepository = new PrismaOrganizationRepository(prismaClient);
  const getOrganizationWebDataCase = new GetOrganzationWebDataUseCase(prismaOrganizationRepository);
  const getOrganizationWebDataController = new GetOrganziationWebDataController(getOrganizationWebDataCase);

  return getOrganizationWebDataController;
};
