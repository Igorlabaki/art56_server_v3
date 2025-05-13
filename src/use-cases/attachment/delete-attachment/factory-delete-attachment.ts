import prismaClient from "../../../services/prisma-client";
import { DeleteAttachmentUseCase } from "./use-case-delete-attachment";
import { DeleteAttachmentController } from "./controller-delete-attachment";
import { PrismaAttachmentRepository } from "../../../repositories/in-prisma/attachment-in-prisma-repository";

export const deleteAttachmentFactory = () => {
  const prismaAttachmentRepository = new PrismaAttachmentRepository(prismaClient);
  const deleteAttachmentCase = new DeleteAttachmentUseCase(prismaAttachmentRepository);
  const deleteAttachmentController = new DeleteAttachmentController(deleteAttachmentCase);

  return deleteAttachmentController;
};
