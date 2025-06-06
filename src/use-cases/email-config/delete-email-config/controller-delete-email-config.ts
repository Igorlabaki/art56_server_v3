import { Request, Response } from "express";
import { DeleteEmailConfigUseCase } from "./delete-email-config-use-case";
import { handleErrors } from "../../../errors/error-handler";

export class DeleteEmailConfigController {
  constructor(
    private readonly deleteEmailConfigUseCase: DeleteEmailConfigUseCase
  ) {}

  async handle(request: Request, response: Response) {
    try {
      const { emailConfigId } = request.params;
      await this.deleteEmailConfigUseCase.execute(emailConfigId);

      return response.status(204).send();
    } catch (error) {
      const errorResponse = handleErrors(error);
      return response.status(errorResponse.statusCode).json(errorResponse.body);
    }
  }
} 