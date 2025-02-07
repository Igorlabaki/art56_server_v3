import { Request, Response } from "express";
import { handleErrors } from "../../../errors/error-handler";
import { UpdateProposalPerDayUseCase } from "./use-case-update-proposal-per-day";
import { updateProposalPerDayRequestParams } from "../../../zod/proposal/update-proposal-per-day--params-schema";

class UpdateProposalPerDayController {
    constructor(private updateProposalUseCase: UpdateProposalPerDayUseCase) { }
    async handle(req: Request, resp: Response) {
        try {
            const param = updateProposalPerDayRequestParams.parse(req.body);
            
            const proposalPerDay = await this.updateProposalUseCase.execute(param);
            
            return resp.json(proposalPerDay)
        } catch (error) {
            // Chamar o handleErrors para formatar o erro
            const errorResponse = handleErrors(error);

            // Retornar a resposta formatada
            return resp.status(errorResponse.statusCode).json(errorResponse.body);
        }
    }
}

export { UpdateProposalPerDayController }
