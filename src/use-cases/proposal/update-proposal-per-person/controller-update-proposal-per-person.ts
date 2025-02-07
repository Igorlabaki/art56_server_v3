import { Request, Response } from "express";
import { handleErrors } from "../../../errors/error-handler";
import { UpdateProposalPerPersonUseCase } from "./use-case-update-proposal-per-person";
import { updateProposalPerPersonRequestParams } from "../../../zod/proposal/update-proposal-per-person-params-schema";

class UpdateProposalPerPersonController {
    constructor(private updateProposalUseCase: UpdateProposalPerPersonUseCase) { }
    async handle(req: Request, resp: Response) {
        try {
            const param = updateProposalPerPersonRequestParams.parse(req.body);
            
            const proposalById = await this.updateProposalUseCase.execute(param);
            
            return resp.json(proposalById)
        } catch (error) {
            // Chamar o handleErrors para formatar o erro
            const errorResponse = handleErrors(error);

            // Retornar a resposta formatada
            return resp.status(errorResponse.statusCode).json(errorResponse.body);
        }
    }
}

export { UpdateProposalPerPersonController }
