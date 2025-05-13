import { Request, Response } from "express";
import { handleErrors } from "../../../errors/error-handler";
import { ForgotPasswordUseCase } from "./use-case-forgot-password";
import { ForgotPasswordRequestParams, forgotPasswordSchema } from "../../../zod/auth/forgot-password-params-schema";

class ForgotPasswordController {
    constructor(private forgotPasswordUseCase: ForgotPasswordUseCase) {}

    async handle(req: Request, resp: Response) {
        try {
            const body: ForgotPasswordRequestParams = req.body;
            forgotPasswordSchema.parse(body);

            const result = await this.forgotPasswordUseCase.execute(body);
            return resp.status(200).json(result);

        } catch (error) {
            const errorResponse = handleErrors(error);
            return resp.status(errorResponse.statusCode).json(errorResponse.body);
        }
    }
}

export { ForgotPasswordController };