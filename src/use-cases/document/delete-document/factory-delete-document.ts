import prismaClient from "../../../services/prisma-client";
import { DeleteDocumentUseCase } from "./use-case-delete-document";
import { DeleteDocumentController } from "./controller-delete-document";
import { PrismaDocumentRepository } from "../../../repositories/in-prisma/document-in-prisma-repository";
import { PrismaPaymentRepository } from "../../../repositories/in-prisma/payment-in-prisma-repository";
import { PrismaProposalRepository } from "../../../repositories/in-prisma/proposal-in-prisma-repository";

export const deleteDocumentFactory = () => {
  const prismaDocumentRepository = new PrismaDocumentRepository(prismaClient);
  const prismaPaymentRepository = new PrismaPaymentRepository(prismaClient);
  const prismaProposalRepository = new PrismaProposalRepository(prismaClient);
  const deleteDocumentCase = new DeleteDocumentUseCase(prismaDocumentRepository, prismaPaymentRepository, prismaProposalRepository
  );
  const deleteDocumentController = new DeleteDocumentController(deleteDocumentCase);

  return deleteDocumentController;
};
