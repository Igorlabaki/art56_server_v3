import { Request, Response } from "express";
import { handleErrors } from "../../../errors/error-handler";
import { UpdateProposalPersonalInfoUseCase } from "./use-case-update-proposal-personal-info";
import { updatePersonalInfoProposalSchema } from "../../../zod/proposal/update-personal-info-proposal-params-schema";

class UpdateProposalPersonalInfoController {
    constructor(private updateProposalUseCase: UpdateProposalPersonalInfoUseCase) { }
    async handle(req: Request, resp: Response) {
        try {
            const param = updatePersonalInfoProposalSchema.parse(req.body);
            
            const proposalPersonalInfo = await this.updateProposalUseCase.execute(param);
            
            return resp.json(proposalPersonalInfo)
        } catch (error) {
            // Chamar o handleErrors para formatar o erro
            const errorResponse = handleErrors(error);

            // Retornar a resposta formatada
            return resp.status(errorResponse.statusCode).json(errorResponse.body);
        }
    }
}

export { UpdateProposalPersonalInfoController }
