import { randomUUID } from "crypto";
import { Request, Response } from "express";
import { PutObjectCommand } from "@aws-sdk/client-s3";
import { s3Client } from "../../../services/upload-config-sw";
import { handleErrors } from "../../../errors/error-handler";
import { CreatePaymentUseCase } from "./use-case-create-payment";
import { CreatePaymentRequestParams, createPaymentSchema } from "../../../zod/payment/create-payment-params-schema";
import { CreateDocumentUseCase } from "../../document/create-document/use-case-create-document";
import { format } from "date-fns";

class CreatePaymentController {
    constructor(private createPaymentUseCase: CreatePaymentUseCase, private createDocumentUseCase : CreateDocumentUseCase) { }

    async handle(req: Request, resp: Response) {
        try {
            const body: CreatePaymentRequestParams = req.body;

            if (req.file) {
                // Gerando um nome único para o arquivo
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
                // Salva no banco com a URL da imagem
                const response = await this.createPaymentUseCase.execute({ ...req.body, imageUrl: fileUrl });

                if(response.success){
                    await this.createDocumentUseCase.execute({paymentId:response.data.id , imageUrl: fileUrl,fileType: "IMAGE", proposalId: body.proposalId, title: `Comprovante-${format(new Date(), "dd/MM/yyyy")}` });
                }
          
                return resp.status(201).json(response);
            }

            // Esperar a execução do caso de uso
            const response = await this.createPaymentUseCase.execute(body);
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

export { CreatePaymentController };
