import { Request, Response } from "express"
import { UpdateUserPasswordCase } from "./use-case-update-user-password"
import { handleErrors } from "../../../errors/error-handler";
import { UpdatePasswordRequestParams, updatePasswordSchema } from "../../../zod/auth/update-password-params-schema";


class UpdateUserPasswordController {
    constructor(private updatePasswordUseCase: UpdateUserPasswordCase) { }
    async handle(req: Request, resp: Response) {
        try {
            const body: UpdatePasswordRequestParams = req.body

            const validatedData = updatePasswordSchema.parse(body);


            const userByid = this.updatePasswordUseCase.execute(validatedData)

            return resp.status(200).json(userByid);

        } catch (error) {
            // Tratar os erros
            const errorResponse = handleErrors(error);
            return resp.status(errorResponse.statusCode).json(errorResponse.body);
        }
    }
}

export { UpdateUserPasswordController }
