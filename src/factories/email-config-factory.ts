import { PrismaClient } from "@prisma/client";
import { EmailConfigController } from "../controllers/email-config-controller";
import { PrismaEmailConfigRepository } from "../repositories/in-prisma/email-config-in-prisma-repository";
import { CreateEmailConfigUseCase } from "../use-cases/email-config/create-email-config/create-email-config-use-case";
import { DeleteEmailConfigUseCase } from "../use-cases/email-config/delete-email-config/delete-email-config-use-case";
import { ListEmailConfigUseCase } from "../use-cases/email-config/list-email-config/list-email-config-use-case";
import { UpdateEmailConfigUseCase } from "../use-cases/email-config/update-email-config/update-email-config-use-case";

export const makeEmailConfigController = () => {
  const prisma = new PrismaClient();
  const emailConfigRepository = new PrismaEmailConfigRepository(prisma);

  const createEmailConfigUseCase = new CreateEmailConfigUseCase(emailConfigRepository);
  const updateEmailConfigUseCase = new UpdateEmailConfigUseCase(emailConfigRepository);
  const deleteEmailConfigUseCase = new DeleteEmailConfigUseCase(emailConfigRepository);
  const listEmailConfigUseCase = new ListEmailConfigUseCase(emailConfigRepository);

  const emailConfigController = new EmailConfigController(
    createEmailConfigUseCase,
    updateEmailConfigUseCase,
    deleteEmailConfigUseCase,
    listEmailConfigUseCase
  );

  return emailConfigController;
}; 