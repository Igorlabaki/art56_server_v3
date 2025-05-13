import prismaClient from "../../../services/prisma-client";
import { UpdatePaymentUseCase } from "./use-case-update-payment";
import { UpdatePaymentController } from "./controller-update-payment";
import { PrismaPaymentRepository } from "../../../repositories/in-prisma/payment-in-prisma-repository";
import { PrismaHistoryRepository } from "../../../repositories/in-prisma/history-in-prisma-repository";
import { PrismaProposalRepository } from "../../../repositories/in-prisma/proposal-in-prisma-repository";

export const updatePaymentFactory = () => {
  const prismaPaymentRepository = new PrismaPaymentRepository(prismaClient);
  const prismaProposalRepository = new PrismaProposalRepository(prismaClient);
  const prismaHistoryRepository = new PrismaHistoryRepository(prismaClient);
  const updatePaymentCase = new UpdatePaymentUseCase(prismaPaymentRepository,prismaHistoryRepository,prismaProposalRepository);
  const updatePaymentController = new UpdatePaymentController(updatePaymentCase);

  return updatePaymentController;
};
