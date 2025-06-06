import { PrismaClient } from "@prisma/client";
import { CreateEmailConfigController } from "./controller-create-email-config";
import { CreateEmailConfigUseCase } from "./create-email-config-use-case";
import { PrismaEmailConfigRepository } from "../../../repositories/in-prisma/email-config-in-prisma-repository";

export const makeCreateEmailConfigController = () => {
  const prisma = new PrismaClient();
  const emailConfigRepository = new PrismaEmailConfigRepository(prisma);
  const createEmailConfigUseCase = new CreateEmailConfigUseCase(emailConfigRepository);
  const createEmailConfigController = new CreateEmailConfigController(createEmailConfigUseCase);

  return createEmailConfigController;
}; 