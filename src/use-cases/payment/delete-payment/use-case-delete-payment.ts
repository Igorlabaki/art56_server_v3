
import { HttpResourceNotFoundError } from "../../../errors/errors-type/http-resource-not-found-error"
import { PaymentRepositoryInterface } from "../../../repositories/interface/payment-repository-interface"
import { ProposalRepositoryInterface } from "../../../repositories/interface/proposal-repository-interface"

class DeletePaymentUseCase {
    constructor(private paymentRepository: PaymentRepositoryInterface, private proposalRepository: ProposalRepositoryInterface) { }

    async execute(paymentId: string) {

        // Validate if payment exists
        const payment = await this.paymentRepository.getById(paymentId)

        if (!payment) {
            throw new HttpResourceNotFoundError("Pagamento")
        }
        //

        const deletedPayment = await this.paymentRepository.delete(paymentId)

        if(!deletedPayment){
            throw new HttpResourceNotFoundError("Pagamento")
        }

        const proposal = await this.proposalRepository.getById(deletedPayment.proposalId)

        if(!proposal){
            throw new HttpResourceNotFoundError("Orcamento")
        }

        await this.proposalRepository.update({
            proposalId: proposal.id,
            data:{
              amountPaid: (proposal.amountPaid || 0) - deletedPayment.amount
            }
          })
      

        const formatedResponse = {
            success: true,
            message: `Pagamento deletado com sucesso`,
            data: {
                ...deletedPayment
            },
            count: 1,
            type: "Payment"
        }

        return formatedResponse
    }
}

export { DeletePaymentUseCase }
