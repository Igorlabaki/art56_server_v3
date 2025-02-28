import prismaClient from "../../../service/prisma-client";
import { DeleteDocumentUseCase } from "./use-case-delete-document";
import { DeleteDocumentController } from "./controller-delete-document";
import { PrismaDocumentRepository } from "../../../repositories/in-prisma/document-in-prisma-repository";

export const deleteDocumentFactory = () => {
  const prismaDocumentRepository = new PrismaDocumentRepository(prismaClient);
  const deleteDocumentCase = new DeleteDocumentUseCase(prismaDocumentRepository);
  const deleteDocumentController = new DeleteDocumentController(deleteDocumentCase);

  return deleteDocumentController;
};
