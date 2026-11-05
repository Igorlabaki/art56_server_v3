import { Request, Response } from "express";
import { handleErrors } from "../../../errors/error-handler";
import { AuthenticatedRequest } from "../../../types/authenticated-request";
import { getByIdProposalSchema } from "../../../zod/proposal/get-by-id-proposal-params-schema";
import { replaceProposalIndicationsBodySchema } from "../../../zod/proposal/replace-proposal-indications-schema";
import { ReplaceProposalIndicationsUseCase } from "./use-case-replace-proposal-indications";

export class ReplaceProposalIndicationsController {
    constructor(private replaceProposalIndicationsUseCase: ReplaceProposalIndicationsUseCase) {}

    async handle(req: Request, resp: Response) {
        try {
            const { proposalId } = getByIdProposalSchema.parse(req.params);
            const { contactIds } = replaceProposalIndicationsBodySchema.parse(req.body);
            const result = await this.replaceProposalIndicationsUseCase.execute({
                proposalId,
                contactIds,
                userId: (req as AuthenticatedRequest).user?.id,
            });
            return resp.status(200).json(result);
        } catch (error) {
            const errorResponse = handleErrors(error);
            return resp.status(errorResponse.statusCode).json(errorResponse.body);
        }
    }
}
