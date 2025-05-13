import prismaClient from "../../../services/prisma-client";
import { CreateDocumentUseCase } from "./use-case-create-document";
import { CreateDocumentController } from "./controller-create-document";
import { PrismaDocumentRepository } from "../../../repositories/in-prisma/document-in-prisma-repository";

export const createDocumentFactory = () => {
  const prismaDocumentRepository = new PrismaDocumentRepository(prismaClient);
  const createDocumentsCase = new CreateDocumentUseCase(prismaDocumentRepository); 
  const createDocumentController = new CreateDocumentController(createDocumentsCase,prismaDocumentRepository);

  return createDocumentController;
};
