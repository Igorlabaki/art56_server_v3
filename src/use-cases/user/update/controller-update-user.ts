import { Request, Response } from "express"
import { UpdateUserCase } from "./use-case-update-user"
import { handleErrors } from "../../../errors/error-handler";
import { UpdateUserRequestParams, updateUserSchema } from "../../../zod/user/update-user-params-schema";
import { randomUUID } from "crypto";
import { s3Client } from "../../../service/upload-config-sw";
import { PutObjectCommand } from "@aws-sdk/client-s3";
class UpdateUserController {
    constructor(private updateUseCase: UpdateUserCase) { }
    async handle(req: Request, resp: Response) {
        try {
            const body: UpdateUserRequestParams = req.body

            updateUserSchema.parse(body);

            if (req.file) {
                const fileKey = `${Date.now()}-${randomUUID()}-${req.file.originalname}`;

                const params = {
                    Bucket: process.env.AWS_BUCKET_NAME!,
                    Key: fileKey,
                    Body: req.file.buffer,
                    ContentType: req.file.mimetype,
                };

                await s3Client.send(new PutObjectCommand(params));

                // URL pública do arquivo
                const fileUrl = `https://${process.env.AWS_BUCKET_NAME}.s3.${process.env.AWS_REGION}.amazonaws.com/${fileKey}`;

                // Esperar a execução do caso de uso
                const response = await this.updateUseCase.execute({
                    avatarUrl: fileUrl,
                    userId: body.userId,
                });
                // Retornar o token
                return resp.json(response);
            }

            // Esperar a execução do caso de uso
            const response = await this.updateUseCase.execute(body);
            // Retornar o token
            return resp.json(response);

        } catch (error) {
            // Chamar o handleErrors para formatar o erro
            const errorResponse = handleErrors(error);

            // Retornar a resposta formatada
            return resp.status(errorResponse.statusCode).json(errorResponse.body);
        }
    }
}

export { UpdateUserController }


