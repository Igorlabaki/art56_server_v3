import { Request, Response } from "express";
import { handleErrors } from "../../../errors/error-handler";
import { UpdateUserOrganizationUseCase } from "./use-case-update-user-organization";
import { UpdateUserOrganizationRequestParams, updateUserOrganizationSchema } from "../../../zod/user-organization/update-user-organization-params-schema";

class UpdateUserOrganizationController {
  constructor(private updateUserOrganizationCase: UpdateUserOrganizationUseCase
  ) {}

  async handle(req: Request, resp: Response) {
    try {
        const body: UpdateUserOrganizationRequestParams = req.body;
        // Validate the request parms
        updateUserOrganizationSchema.parse(body);

        // Esperar a execução do caso de uso
        const response = await this.updateUserOrganizationCase.execute(body);
        // Retornar o token
        return resp.status(201).json(response);

    } catch (error) {
        // Chamar o handleErrors para formatar o erro
        const errorResponse = handleErrors(error);

        // Retornar a resposta formatada
        return resp.status(errorResponse.statusCode).json(errorResponse.body);
    }
}
}

export { UpdateUserOrganizationController };
