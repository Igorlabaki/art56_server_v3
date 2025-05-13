import prismaClient from "../../../services/prisma-client";
import { UpdateAttachmentUseCase } from "./use-case-update-attachment";
import { UpdateAttachmentController } from "./controller-update-attachment";
import { PrismaAttachmentRepository } from "../../../repositories/in-prisma/attachment-in-prisma-repository";

export const updateAttachmentFactory = () => {
  const prismaAttachmentRepository = new PrismaAttachmentRepository(prismaClient);
  const updateAttachmentCase = new UpdateAttachmentUseCase(prismaAttachmentRepository);
  const updateAttachmentController = new UpdateAttachmentController(updateAttachmentCase);

  return updateAttachmentController;
};
