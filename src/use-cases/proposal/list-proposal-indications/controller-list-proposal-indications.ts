import { Request, Response } from "express";
import { handleErrors } from "../../../errors/error-handler";
import { getByIdProposalSchema } from "../../../zod/proposal/get-by-id-proposal-params-schema";
import { ListProposalIndicationsUseCase } from "./use-case-list-proposal-indications";

export class ListProposalIndicationsController {
    constructor(private listProposalIndicationsUseCase: ListProposalIndicationsUseCase) {}

    async handle(req: Request, resp: Response) {
        try {
            const { proposalId } = getByIdProposalSchema.parse(req.params);
            const result = await this.listProposalIndicationsUseCase.execute(proposalId);
            return resp.status(200).json(result);
        } catch (error) {
            const errorResponse = handleErrors(error);
            return resp.status(errorResponse.statusCode).json(errorResponse.body);
        }
    }
}
