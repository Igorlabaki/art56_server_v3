import { PrismaClient } from "@prisma/client";
import { DeleteEmailConfigController } from "./controller-delete-email-config";
import { DeleteEmailConfigUseCase } from "./delete-email-config-use-case";
import { PrismaEmailConfigRepository } from "../../../repositories/in-prisma/email-config-in-prisma-repository";

export const makeDeleteEmailConfigController = () => {
  const prisma = new PrismaClient();
  const emailConfigRepository = new PrismaEmailConfigRepository(prisma);
  const deleteEmailConfigUseCase = new DeleteEmailConfigUseCase(emailConfigRepository);
  const deleteEmailConfigController = new DeleteEmailConfigController(deleteEmailConfigUseCase);

  return deleteEmailConfigController;
}; 