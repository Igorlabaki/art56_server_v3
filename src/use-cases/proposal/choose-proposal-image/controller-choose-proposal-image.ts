import { Request, Response } from "express";
import { handleErrors } from "../../../errors/error-handler";
import { AuthenticatedRequest } from "../../../types/authenticated-request";
import { chooseProposalImageSchema } from "../../../zod/proposal/choose-proposal-image-schema";
import { getByIdProposalSchema } from "../../../zod/proposal/get-by-id-proposal-params-schema";
import { ChooseProposalImageUseCase } from "./use-case-choose-proposal-image";

class ChooseProposalImageController {
    constructor(private chooseProposalImageUseCase: ChooseProposalImageUseCase) { }

    async handle(req: Request, resp: Response) {
        try {
            const params = getByIdProposalSchema.parse(req.params);
            const body = chooseProposalImageSchema.parse(req.body);
            const userId = (req as AuthenticatedRequest).user?.id ?? null;
            const result = await this.chooseProposalImageUseCase.execute({
                proposalId: params.proposalId,
                slotId: body.slotId,
                replacementId: body.replacementId,
                userId,
            });
            return resp.status(200).json(result);
        } catch (error) {
            const errorResponse = handleErrors(error);
            return resp.status(errorResponse.statusCode).json(errorResponse.body);
        }
    }
}

export { ChooseProposalImageController };
