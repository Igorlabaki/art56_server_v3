import prismaClient from "../../../services/prisma-client";
import { PrismaVenueRepository } from "../../../repositories/in-prisma/venue-in-prisma-repository";
import { GetEmailConfigByTypeUseCase } from "./use-case-get-by-type";
import { PrismaEmailConfigRepository } from "../../../repositories/in-prisma/email-config-in-prisma-repository";
import { GetEmailConfigByTypeController } from "./controller-get-by-type";

export const getEmailConfigByTypeFactory = () => {
  const prismaEmailConfigRepository = new PrismaEmailConfigRepository(prismaClient);
  const getEmailConfigByTypeCase = new GetEmailConfigByTypeUseCase(prismaEmailConfigRepository);
  const getEmailConfigByTypeController = new GetEmailConfigByTypeController(getEmailConfigByTypeCase);

  return getEmailConfigByTypeController;
};
