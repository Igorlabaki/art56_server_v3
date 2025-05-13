import prismaClient from "../../../services/prisma-client";
import { DeletePaymentUseCase } from "./use-case-delete-payment";
import { DeletePaymentController } from "./controller-delete-payment";
import { PrismaPaymentRepository } from "../../../repositories/in-prisma/payment-in-prisma-repository";
import { PrismaProposalRepository } from "../../../repositories/in-prisma/proposal-in-prisma-repository";

export const deletePaymentFactory = () => {
  const prismaPaymentRepository = new PrismaPaymentRepository(prismaClient);
  const prismaProposalRepository = new PrismaProposalRepository(prismaClient);
  const deletePaymentCase = new DeletePaymentUseCase(prismaPaymentRepository,prismaProposalRepository);
  const deletePaymentController = new DeletePaymentController(deletePaymentCase);

  return deletePaymentController;
};
