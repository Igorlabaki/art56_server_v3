import { Request, Response } from "express";
import { handleErrors } from "../../../errors/error-handler";
import { readOptionalUserId } from "../../../middleware/ensureAuthenticate";
import { getByIdProposalSchema } from "../../../zod/proposal/get-by-id-proposal-params-schema";
import { GetProposalPresentationUseCase } from "./use-case-get-proposal-presentation";

class GetProposalPresentationController {
    constructor(private getProposalPresentationUseCase: GetProposalPresentationUseCase) { }

    async handle(req: Request, resp: Response) {
        try {
            const params = getByIdProposalSchema.parse(req.params);
            const presentation = await this.getProposalPresentationUseCase.execute({
                ...params,
                userId: readOptionalUserId(req),
            });
            return resp.status(200).json(presentation);
        } catch (error) {
            const errorResponse = handleErrors(error);
            return resp.status(errorResponse.statusCode).json(errorResponse.body);
        }
    }
}

export { GetProposalPresentationController };
