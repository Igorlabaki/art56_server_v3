import prismaClient from "../../../services/prisma-client";
import { ListPaymentsUseCase } from "./use-case-list-payment";
import { ListPaymentController } from "./controller-list-payment";
import { PrismaPaymentRepository } from "../../../repositories/in-prisma/payment-in-prisma-repository";

export const listPaymentFactory = (): ListPaymentController => {
    const prismaPaymentRepository = new PrismaPaymentRepository(prismaClient);
    const listPaymentUseCase = new ListPaymentsUseCase(prismaPaymentRepository);
    const listPaymentController = new ListPaymentController(listPaymentUseCase);

    return listPaymentController;
};
