import prismaClient from "../../../services/prisma-client";
import { UpdateDocumentUseCase } from "./use-case-update-document";
import { UpdateDocumentController } from "./controller-update-document";
import { PrismaDocumentRepository } from "../../../repositories/in-prisma/document-in-prisma-repository";

export const updateDocumentFactory = () => {
  const prismaDocumentRepository = new PrismaDocumentRepository(prismaClient);
  const updateDocumentCase = new UpdateDocumentUseCase(prismaDocumentRepository);
  const updateDocumentController = new UpdateDocumentController(updateDocumentCase,prismaDocumentRepository);

  return updateDocumentController;
};
