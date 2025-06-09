import { PrismaClient } from "@prisma/client";
import { CreateEmailConfigController } from "./controller-create-email-config";
import { CreateEmailConfigUseCase } from "./create-email-config-use-case";
import { PrismaEmailConfigRepository } from "../../../repositories/in-prisma/email-config-in-prisma-repository";
import prismaClient from "../../../services/prisma-client";

export const makeCreateEmailConfigController = () => {
  const emailConfigRepository = new PrismaEmailConfigRepository(prismaClient);
  const createEmailConfigUseCase = new CreateEmailConfigUseCase(emailConfigRepository);
  const createEmailConfigController = new CreateEmailConfigController(createEmailConfigUseCase);

  return createEmailConfigController;
}; 