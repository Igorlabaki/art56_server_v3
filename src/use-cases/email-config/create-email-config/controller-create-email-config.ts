import { Request, Response } from "express";
import { CreateEmailConfigUseCase } from "./create-email-config-use-case";
import { createEmailConfigParamsSchema } from "../../../zod/email-config/create-email-config-params-schema";
import { handleErrors } from "../../../errors/error-handler";

export class CreateEmailConfigController {
  constructor(
    private readonly createEmailConfigUseCase: CreateEmailConfigUseCase
  ) {}

  async handle(request: Request, response: Response) {
    try {
      console.log(request.body)
      const params = createEmailConfigParamsSchema.parse(request.body);
      const emailConfig = await this.createEmailConfigUseCase.execute(params);

      return response.status(201).json(emailConfig);
    } catch (error) {
      const errorResponse = handleErrors(error);
      return response.status(errorResponse.statusCode).json(errorResponse.body);
    }
  }
} 