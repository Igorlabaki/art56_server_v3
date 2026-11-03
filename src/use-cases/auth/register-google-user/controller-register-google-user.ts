import { Request, Response } from "express";
import { handleErrors } from "../../../errors/error-handler";
import { RegisterGoogleUserUseCase } from "./use-case-register-google-user";
import { RegisterGoogleUserRequestParams, registerGoogleUserSchema } from "../../../zod/auth/register-google-user-params-schema";

class RegisterGoogleUserController {
    constructor(private registerGoogleUserUseCase: RegisterGoogleUserUseCase) { }

    async handle(req: Request, resp: Response) {
        try {
            const body: RegisterGoogleUserRequestParams = req.body;
            // [DEBUG] Log payload (sem dados sensíveis)
            console.log("[POST /auth/register/google] body:", {
                hasGoogleToken: !!body?.googleToken,
                userData: body?.userData ? { email: body.userData.email, name: body.userData.name, googleId: body.userData.googleId, hasPicture: !!body.userData.picture, hasPassword: !!body.userData?.password } : undefined,
            });
            // Validate the request parms
            registerGoogleUserSchema.parse(body);

            // Esperar a execução do caso de uso
            const response = await this.registerGoogleUserUseCase.execute(body);
            // Retornar o token
            return resp.json(response);

        } catch (error) {
            // [DEBUG] Log do erro completo no servidor
            console.error("[POST /auth/register/google] error:", error instanceof Error ? error.message : String(error));
            if (error instanceof Error && error.stack) console.error("[POST /auth/register/google] stack:", error.stack);
            // Chamar o handleErrors para formatar o erro
            const errorResponse = handleErrors(error);

            // Retornar a resposta formatada
            return resp.status(errorResponse.statusCode).json(errorResponse.body);
        }
    }
}

export { RegisterGoogleUserController };