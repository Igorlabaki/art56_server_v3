import prismaClient from "../../../services/prisma-client";
import { ListDocumentsUseCase } from "./use-case-list-document";
import { ListDocumentController } from "./controller-list-document";
import { PrismaDocumentRepository } from "../../../repositories/in-prisma/document-in-prisma-repository";

export const listDocumentFactory = (): ListDocumentController => {
    const prismaDocumentRepository = new PrismaDocumentRepository(prismaClient);
    const listDocumentUseCase = new ListDocumentsUseCase(prismaDocumentRepository);
    const listDocumentController = new ListDocumentController(listDocumentUseCase);

    return listDocumentController;
};
