import { Request, Response } from "express";
import { ListEmailConfigUseCase } from "./list-email-config-use-case";
import { listEmailConfigQuerySchema } from "../../../zod/email-config/list-email-config-query-schema";
import { handleErrors } from "../../../errors/error-handler";

export class ListEmailConfigController {
  constructor(
    private readonly listEmailConfigUseCase: ListEmailConfigUseCase
  ) {}

  async handle(request: Request, response: Response) {
    try {
      const params = listEmailConfigQuerySchema.parse(request.query);
      const emailConfigs = await this.listEmailConfigUseCase.execute(params);

      return response.status(200).json(emailConfigs);
    } catch (error) {
      const errorResponse = handleErrors(error);
      return response.status(errorResponse.statusCode).json(errorResponse.body);
    }
  }
} 