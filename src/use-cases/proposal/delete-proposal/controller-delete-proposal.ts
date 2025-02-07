import { Request, Response } from "express"
import { handleErrors } from "../../../errors/error-handler";
import { DeleteProposalByIdUseCase } from "./use-case-get-delete-proposal";
import { deleteByIdProposalSchema } from "../../../zod/proposal/delete-proposal-params-schema";

class DeleteProposalByIdController {
    constructor(private deleteProposalByIdUseCase: DeleteProposalByIdUseCase) { }
    async handle(req: Request, resp: Response) {
        try {
            const query = deleteByIdProposalSchema.parse(req.params);
            const proposalById = await this.deleteProposalByIdUseCase.execute(query);
            
            return resp.json(proposalById)
        } catch (error) {
            // Chamar o handleErrors para formatar o erro
            const errorResponse = handleErrors(error);

            // Retornar a resposta formatada
            return resp.status(errorResponse.statusCode).json(errorResponse.body);
        }
    }
}

export { DeleteProposalByIdController }
