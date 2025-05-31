import { parse } from "date-fns";
import { HttpBadRequestError } from "../../../errors/errors-type/htttp-bad-request-error";
import { HttConfigurationError } from "../../../errors/errors-type/http-configuration-error";
import { CreatePaymentRequestParams } from "../../../zod/payment/create-payment-params-schema";
import { HttpResourceNotFoundError } from "../../../errors/errors-type/http-resource-not-found-error";
import { PaymentRepositoryInterface } from "../../../repositories/interface/payment-repository-interface";
import { HistoryRepositoryInterface } from "../../../repositories/interface/history-repository-interface";
import { ProposalRepositoryInterface } from "../../../repositories/interface/proposal-repository-interface";

class CreatePaymentUseCase {
  constructor(
    private paymentRepository: PaymentRepositoryInterface,
    private historyRepository: HistoryRepositoryInterface,
    private proposalRepository: ProposalRepositoryInterface,
  ) { }

  async execute(params: CreatePaymentRequestParams) {
    console.log("usecase")
    const { proposalId, userId, venueId, username, amount, paymentDate, imageUrl } = params

    const proposalById = await this.proposalRepository.getById(proposalId);
    console.log(proposalById, "proposalById")
    if (!proposalById) {
      throw new HttpResourceNotFoundError("Orcamento")
    }

    if (proposalById.totalAmount - (proposalById.amountPaid || 0) < params.amount) {
      throw new HttpBadRequestError("Valor pago maior do que o montante devedor.")
    }

    console.log(paymentDate, "paymentDate")
    const data = parse(paymentDate, "dd/MM/yyyy", new Date());
    console.log(data, "data")
    const newPayment = await this.paymentRepository.create({
      venueId,
      proposalId,
      amount: Number(amount),
      paymentDate: data,
      imageUrl
    });
    console.log(newPayment, "newPayment")
    if (!newPayment) {
      throw new HttConfigurationError("Erro ao cadastrar pagamento.")
    }

    await this.proposalRepository.update({
      proposalId: proposalById.id,
      data: {
        amountPaid: (proposalById.amountPaid || 0) + newPayment.amount
      }
    })
    console.log("update")

    await this.historyRepository.create({
      userId: userId,
      proposalId: proposalId,
      action: `${username} cadastrou um pagamento`,
    });

    const formatedResponse = {
      success: true,
      message: "Pagamento cadastrado com sucesso",
      data: {
        ...newPayment
      },
      count: 1,
      type: "Payment"
    }
    console.log(formatedResponse, "formatedResponse")
    return formatedResponse
  }
}

export { CreatePaymentUseCase };
