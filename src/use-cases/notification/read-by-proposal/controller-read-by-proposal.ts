import { Request, Response } from "express";
import { handleErrors } from "../../../errors/error-handler";
import { HttpTokenError } from "../../../errors/errors-type/http-token-error";
import { AuthenticatedRequest } from "../../../types/authenticated-request";
import { getByIdProposalSchema } from "../../../zod/proposal/get-by-id-proposal-params-schema";
import { ReadNotificationsByProposalUseCase } from "./use-case-read-by-proposal";

class ReadNotificationsByProposalController {
  constructor(private useCase: ReadNotificationsByProposalUseCase) { }

  async handle(req: Request, resp: Response) {
    try {
      const { proposalId } = getByIdProposalSchema.parse(req.params);
      const userId = (req as AuthenticatedRequest).user?.id;
      if (!userId) {
        throw new HttpTokenError();
      }
      const response = await this.useCase.execute({ proposalId, userId });
      return resp.status(200).json(response);
    } catch (error) {
      const errorResponse = handleErrors(error);
      return resp.status(errorResponse.statusCode).json(errorResponse.body);
    }
  }
}

export { ReadNotificationsByProposalController };
