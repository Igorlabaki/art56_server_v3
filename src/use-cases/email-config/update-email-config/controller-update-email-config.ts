import { Request, Response } from "express";
import { UpdateEmailConfigUseCase } from "./update-email-config-use-case";
import { updateEmailConfigParamsSchema } from "../../../zod/email-config/update-email-config-params-schema";
import { handleErrors } from "../../../errors/error-handler";

export class UpdateEmailConfigController {
  constructor(
    private readonly updateEmailConfigUseCase: UpdateEmailConfigUseCase
  ) {}

  async handle(request: Request, response: Response) {
    try {
      const params = updateEmailConfigParamsSchema.parse(request.body);
      const emailConfig = await this.updateEmailConfigUseCase.execute(params);

      return response.status(200).json(emailConfig);
    } catch (error) {
      const errorResponse = handleErrors(error);
      return response.status(errorResponse.statusCode).json(errorResponse.body);
    }
  }
} 