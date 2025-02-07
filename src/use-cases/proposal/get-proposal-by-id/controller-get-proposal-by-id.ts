import { Request, Response } from "express"
import { handleErrors } from "../../../errors/error-handler";
import { GetProposalByIdUseCase } from "./use-case-get-proposal-by-id";
import { getByIdProposalSchema } from "../../../zod/proposal/get-by-id-proposal-params-schema";


class GetProposalByIdController {
    constructor(private getProposalByIdUseCase: GetProposalByIdUseCase) { }
    async handle(req: Request, resp: Response) {
        try {
            const query = getByIdProposalSchema.parse(req.params);
            const proposalById = await this.getProposalByIdUseCase.execute(query);
        
            return resp.status(200).json(proposalById);
        } catch (error) {
            // Chamar o handleErrors para formatar o erro
            const errorResponse = handleErrors(error);

            // Retornar a resposta formatada
            return resp.status(errorResponse.statusCode).json(errorResponse.body);
        }
    }
}

export { GetProposalByIdController }
