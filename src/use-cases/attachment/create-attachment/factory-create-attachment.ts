import prismaClient from "../../../service/prisma-client";
import { CreateAttachmentUseCase } from "./use-case-create-attachment";
import { CreateAttachmentController } from "./controller-create-attachment";
import { PrismaAttachmentRepository } from "../../../repositories/in-prisma/attachment-in-prisma-repository";

export const createAttachmentFactory = () => {
  const prismaAttachmentRepository = new PrismaAttachmentRepository(prismaClient);
  const createAttachmentsCase = new CreateAttachmentUseCase(prismaAttachmentRepository); 
  const createAttachmentController = new CreateAttachmentController(createAttachmentsCase);

  return createAttachmentController;
};
