import { parse, isValid } from "date-fns";
import { HttpBadRequestError } from "../../../errors/errors-type/htttp-bad-request-error";
import { HttConfigurationError } from "../../../errors/errors-type/http-configuration-error";
import { UpdatePaymentRequestParams } from "../../../zod/payment/update-payment-params-schema";
import { HttpResourceNotFoundError } from "../../../errors/errors-type/http-resource-not-found-error";
import { PaymentRepositoryInterface } from "../../../repositories/interface/payment-repository-interface";
import { HistoryRepositoryInterface } from "../../../repositories/interface/history-repository-interface";
import { ProposalRepositoryInterface } from "../../../repositories/interface/proposal-repository-interface";

class UpdatePaymentUseCase {
    constructor(
        private paymentRepository: PaymentRepositoryInterface,
        private historyRepository: HistoryRepositoryInterface,
        private proposalRepository: ProposalRepositoryInterface,
    ) { }

    async execute(param: UpdatePaymentRequestParams) {
        const { userId, username, proposalId, paymentId, amount, paymentDate, imageUrl, paymentMethod } = param;

        // Verifica se a proposta existe
        const proposalById = await this.proposalRepository.getById(proposalId);
        if (!proposalById) {
            throw new HttpResourceNotFoundError("Orçamento não encontrado.");
        }

        // Verifica se o pagamento existe
        const paymentById = await this.paymentRepository.getById(paymentId);
        if (!paymentById) {
            throw new HttpResourceNotFoundError("Pagamento não encontrado.");
        }

        // Verifica se o valor pago excede o montante devido
        const novoTotalPago = (proposalById.amountPaid || 0) - paymentById.amount + Number(amount);
        if (novoTotalPago > proposalById.totalAmount) {
            throw new HttpBadRequestError("Valor pago maior do que o montante devedor.");
        }

        // Converte e valida a data
        const formattedDate = parse(paymentDate, "dd/MM/yyyy", new Date());
        if (!isValid(formattedDate)) {
            throw new HttpBadRequestError("Data de pagamento inválida.");
        }

        // Atualiza o pagamento
        const updatedPayment = await this.paymentRepository.update({
            paymentId,
            data: {
                amount: Number(amount),
                paymentDate: formattedDate,
                imageUrl: imageUrl,
                paymentMethod: paymentMethod,
            },
        });

        if (!updatedPayment) {
            throw new HttConfigurationError("Erro ao atualizar o pagamento.");
        }

        // Atualiza a proposta com o novo valor pago
        await this.proposalRepository.update({
            proposalId: proposalById.id,
            data: {
                amountPaid: novoTotalPago, // Corrigindo o cálculo
            },
        });

        // Registra a ação no histórico
        await this.historyRepository.create({
            userId,
            proposalId: updatedPayment.proposalId,
            action: `${username} atualizou um pagamento.`,
        });

        // Retorna a resposta formatada
        return {
            success: true,
            message: "Pagamento atualizado com sucesso.",
            data: updatedPayment,
            count: 1,
            type: "Payment",
        };
    }
}

export { UpdatePaymentUseCase };