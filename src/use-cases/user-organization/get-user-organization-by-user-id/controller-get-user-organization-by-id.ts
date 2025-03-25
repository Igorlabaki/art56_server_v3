import { Request, Response } from "express"
import { handleErrors } from "../../../errors/error-handler";
import { GetUserOrganizationByIdUseCase } from "./use-case-get-user-organization-by-id";
import { getByIdUserOrganizationSchema } from "../../../zod/user-organization/get-by-id-user-organization-params-schema";

class GetUserOrganizationByIdController {
    constructor(private getUserOrganizationByIdUseCase: GetUserOrganizationByIdUseCase) { }
    async handle(req: Request, resp: Response) {
        try {
            const query = getByIdUserOrganizationSchema.parse(req.query);
            const UserorganizationById = await this.getUserOrganizationByIdUseCase.execute(query);
            
            return resp.json(UserorganizationById)
        } catch (error) {
            // Chamar o handleErrors para formatar o erro
            const errorResponse = handleErrors(error);

            // Retornar a resposta formatada
            return resp.status(errorResponse.statusCode).json(errorResponse.body);
        }
    }
}

export { GetUserOrganizationByIdController }
