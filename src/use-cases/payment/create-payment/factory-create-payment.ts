import prismaClient from "../../../service/prisma-client";
import { CreatePaymentUseCase } from "./use-case-create-payment";
import { CreatePaymentController } from "./controller-create-payment";
import { PrismaPaymentRepository } from "../../../repositories/in-prisma/payment-in-prisma-repository";
import { PrismaHistoryRepository } from "../../../repositories/in-prisma/history-in-prisma-repository";
import { PrismaProposalRepository } from "../../../repositories/in-prisma/proposal-in-prisma-repository";

export const createPaymentFactory = () => {
  const prismaPaymentRepository = new PrismaPaymentRepository(prismaClient);
  const prismaHistoryRepository = new PrismaHistoryRepository(prismaClient);
  const prismaProposalRepository = new PrismaProposalRepository(prismaClient);
  const createPaymentsCase = new CreatePaymentUseCase(prismaPaymentRepository,prismaHistoryRepository,prismaProposalRepository); 
  const createPaymentController = new CreatePaymentController(createPaymentsCase);

  return createPaymentController;
};
