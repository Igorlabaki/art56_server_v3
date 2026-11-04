import { Request, Response } from "express";
import { handleErrors } from "../../../errors/error-handler";
import { AuthenticatedRequest } from "../../../types/authenticated-request";
import { getByIdProposalSchema } from "../../../zod/proposal/get-by-id-proposal-params-schema";
import { reorderProposalImagesSchema } from "../../../zod/proposal/reorder-proposal-images-schema";
import { ReorderProposalImagesUseCase } from "./use-case-reorder-proposal-images";

class ReorderProposalImagesController {
    constructor(private reorderProposalImagesUseCase: ReorderProposalImagesUseCase) { }

    async handle(req: Request, resp: Response) {
        try {
            const params = getByIdProposalSchema.parse(req.params);
            const body = reorderProposalImagesSchema.parse(req.body);
            const userId = (req as AuthenticatedRequest).user?.id ?? null;
            const result = await this.reorderProposalImagesUseCase.execute({
                proposalId: params.proposalId,
                imageIds: body.imageIds,
                userId,
            });
            return resp.status(200).json(result);
        } catch (error) {
            const errorResponse = handleErrors(error);
            return resp.status(errorResponse.statusCode).json(errorResponse.body);
        }
    }
}

export { ReorderProposalImagesController };
