import { PrismaClient } from "@prisma/client";
import { ListEmailConfigController } from "./controller-list-email-config";
import { ListEmailConfigUseCase } from "./list-email-config-use-case";
import { PrismaEmailConfigRepository } from "../../../repositories/in-prisma/email-config-in-prisma-repository";

export const makeListEmailConfigController = () => {
  const prisma = new PrismaClient();
  const emailConfigRepository = new PrismaEmailConfigRepository(prisma);
  const listEmailConfigUseCase = new ListEmailConfigUseCase(emailConfigRepository);
  const listEmailConfigController = new ListEmailConfigController(listEmailConfigUseCase);

  return listEmailConfigController;
}; 