import { Payment } from "@prisma/client";

import { CreatePaymentInDb } from "../../zod/payment/create-payment-db";
import { UpdatePaymentIndBSchema } from "../../zod/payment/update-payment-in-db";
import { ListPaymentRequestQuerySchema } from "../../zod/payment/list-payment-query-schema";

export interface PaymentRepositoryInterface {
  delete: (params: string) => Promise<Payment | null>;  
  getById: (params: string) => Promise<Payment | null>;
  update: (params: UpdatePaymentIndBSchema) => Promise<Payment | null>;
  create: (params: CreatePaymentInDb) => Promise<Payment | null>;
  list: (params: ListPaymentRequestQuerySchema) => Promise<Payment[]  | null>;
}