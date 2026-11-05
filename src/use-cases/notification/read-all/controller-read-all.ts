import { Request, Response } from "express";
import { handleErrors } from "../../../errors/error-handler";
import { HttpTokenError } from "../../../errors/errors-type/http-token-error";
import { AuthenticatedRequest } from "../../../types/authenticated-request";
import { z } from "zod";
import { ReadAllNotificationsUseCase } from "./use-case-read-all";

const paramsSchema = z.object({ venueId: z.string().min(1) });

class ReadAllNotificationsController {
  constructor(private useCase: ReadAllNotificationsUseCase) { }

  async handle(req: Request, resp: Response) {
    try {
      const { venueId } = paramsSchema.parse(req.params);
      const userId = (req as AuthenticatedRequest).user?.id;
      if (!userId) {
        throw new HttpTokenError();
      }
      const response = await this.useCase.execute({ venueId, userId });
      return resp.status(200).json(response);
    } catch (error) {
      const errorResponse = handleErrors(error);
      return resp.status(errorResponse.statusCode).json(errorResponse.body);
    }
  }
}

export { ReadAllNotificationsController };
