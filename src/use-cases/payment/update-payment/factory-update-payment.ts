import prismaClient from "../../../services/prisma-client";
import { UpdatePaymentUseCase } from "./use-case-update-payment";
import { UpdatePaymentController } from "./controller-update-payment";
import { PrismaPaymentRepository } from "../../../repositories/in-prisma/payment-in-prisma-repository";
import { UpdateDocumentUseCase } from "../../document/update-document/use-case-update-document";
import { PrismaDocumentRepository } from "../../../repositories/in-prisma/document-in-prisma-repository";
import { PrismaHistoryRepository } from "../../../repositories/in-prisma/history-in-prisma-repository";
import { PrismaProposalRepository } from "../../../repositories/in-prisma/proposal-in-prisma-repository";

export const updatePaymentFactory = () => {
  const prismaPaymentRepository = new PrismaPaymentRepository(prismaClient);
  const prismaDocumentRepository = new PrismaDocumentRepository(prismaClient);
  const prismaHistoryRepository = new PrismaHistoryRepository(prismaClient);
  const prismaProposalRepository = new PrismaProposalRepository(prismaClient);
  
  const updatePaymentCase = new UpdatePaymentUseCase(
    prismaPaymentRepository,
    prismaHistoryRepository,
    prismaProposalRepository
  );
  const updateDocumentCase = new UpdateDocumentUseCase(prismaDocumentRepository);
  const updatePaymentController = new UpdatePaymentController(
    updatePaymentCase,
    updateDocumentCase,
    prismaDocumentRepository,
    prismaPaymentRepository
  );

  return updatePaymentController;
};
