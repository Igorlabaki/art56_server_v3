import { Request, Response } from "express";
import { handleErrors } from "../../../errors/error-handler";
import { ResetPasswordUseCase } from "./use-case-reset-password";
import { ResetPasswordRequestParams, resetPasswordSchema } from "../../../zod/auth/reset-password-params-schema";

class ResetPasswordController {
    constructor(private resetPasswordUseCase: ResetPasswordUseCase) {}

    async handle(req: Request, resp: Response) {
        try {
            const body: ResetPasswordRequestParams = req.body;
            resetPasswordSchema.parse(body);

            const result = await this.resetPasswordUseCase.execute(body);
            return resp.status(200).json(result);

        } catch (error) {
            const errorResponse = handleErrors(error);
            return resp.status(errorResponse.statusCode).json(errorResponse.body);
        }
    }
}

export { ResetPasswordController };