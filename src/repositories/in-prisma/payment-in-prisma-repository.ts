import { PrismaClient, Payment } from "@prisma/client";
import { CreatePaymentInDb } from "../../zod/payment/create-payment-DB";
import { UpdatePaymentIndBSchema } from "../../zod/payment/update-payment-in-db";
import { PaymentRepositoryInterface } from "../interface/payment-repository-interface";
import { ListPaymentRequestQuerySchema } from "../../zod/payment/list-payment-query-schema";

export class PrismaPaymentRepository implements PaymentRepositoryInterface {
  constructor(private readonly prisma: PrismaClient) { }

  async create({ proposalId, venueId, ...rest }: CreatePaymentInDb): Promise<Payment | null> {
    return await this.prisma.payment.create({
      data: {
        proposal: {
          connect: {
            id: proposalId
          }
        },
        venue: {
          connect: {
            id: venueId
          }
        }
        ,
        ...rest
      },
    });
  }

  async delete(reference: string): Promise<Payment | null> {
    return await this.prisma.payment.delete({
      where: {
        id: reference,
      },
    });
  }

  async getById(reference: string): Promise<Payment | null> {
    return await this.prisma.payment.findFirst({
      where: {
        id: reference,
      },
    });
  }

  async update({ data, paymentId }: UpdatePaymentIndBSchema): Promise<Payment | null> {
    return await this.prisma.payment.update({
      where: {
        id: paymentId,
      },
      data: {
        ...data,
      },
    });
  }

  async list({ venueId, proposalId }: ListPaymentRequestQuerySchema): Promise<Payment[]> {
    return await this.prisma.payment.findMany({
      where: {
        venueId,
        ...(proposalId && {
          proposalId
        }),
      },
    });
  }
}
