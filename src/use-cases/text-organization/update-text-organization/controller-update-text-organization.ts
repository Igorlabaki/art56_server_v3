import { Request, Response } from "express";
import { handleErrors } from "../../../errors/error-handler";
import { updateTextOrganizationSchema } from "../../../zod/text-organization/update-text-organization-params-schema";
import { UpdateTextOrganizationUseCase } from "./use-case-update-text-organization";


class UpdateTextOrganizationController {
    constructor(private updateTextOrganizationUseCase: UpdateTextOrganizationUseCase) { }
    async handle(req: Request, resp: Response) {
        try {
            const param = updateTextOrganizationSchema.parse(req.body);

            const response = await this.updateTextOrganizationUseCase.execute(param);
            
            return resp.json(response)
        } catch (error) {
            // Chamar o handleErrors para formatar o erro
            const errorResponse = handleErrors(error);

            // Retornar a resposta formatada
            return resp.status(errorResponse.statusCode).json(errorResponse.body);
        }
    }
}

export { UpdateTextOrganizationController }
