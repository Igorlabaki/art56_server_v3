import { HttpResourceNotFoundError } from "../../../errors/errors-type/http-resource-not-found-error";
import { DateEventRepositoryInterface } from "../../../repositories/interface/data-event-repository-interface";
import { ProposalRepositoryInterface } from "../../../repositories/interface/proposal-repository-interface";

class DeleteDateEventUseCase {
    constructor(
        private dateeventRepository: DateEventRepositoryInterface,
        private proposalRepository: ProposalRepositoryInterface
    ) { }

    async execute(param: string) {

        // Validate if dateevent exists
        const dateEvent = await this.dateeventRepository.getById(param)

        if (!dateEvent) {
            throw new HttpResourceNotFoundError("Data")
        }
        //

        const deletedDateEvent = await this.dateeventRepository.delete(param)

        if (deletedDateEvent && deletedDateEvent.proposalId && deletedDateEvent?.type === "EVENT" || deletedDateEvent &&  deletedDateEvent.proposalId && deletedDateEvent?.type === "OVERNIGHT") {
            const teste = await this.proposalRepository.update({
                proposalId: deletedDateEvent.proposalId,
                data: {
                    approved: false
                }
            });

            console.log(teste)
        }

        const formatedResponse = {
            success: true,
            message: `Data deletada com sucesso`,
            data: {
                ...deletedDateEvent
            },
            count: 1,
            type: "DateEvent"
        }

        return formatedResponse
    }
}

export { DeleteDateEventUseCase }
