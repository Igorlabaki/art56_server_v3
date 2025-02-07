import { ListPaymentRequestQuerySchema } from "../../../zod/payment/list-payment-query-schema";
import { PaymentRepositoryInterface } from "../../../repositories/interface/payment-repository-interface";

class ListPaymentsUseCase {
  constructor(private paymentRepository: PaymentRepositoryInterface) { }

  async execute(query: ListPaymentRequestQuerySchema) {
    const paymentList = await this.paymentRepository.list(query);

    const formatedResponse = {
      success: true,
      message: `Lista de pagamentos com ${paymentList?.length} items`,
      data: {
        paymentList: paymentList
      },
      count: paymentList?.length,
      type: "List"
    }

    return formatedResponse;
  }
}

export { ListPaymentsUseCase };
