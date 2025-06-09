import { Request, Response } from "express";
import { CreateEmailConfigUseCase } from "./create-email-config-use-case";
import { createEmailConfigParamsSchema } from "../../../zod/email-config/create-email-config-params-schema";
import { handleErrors } from "../../../errors/error-handler";
import { randomUUID } from "crypto";
import { PutObjectCommand } from "@aws-sdk/client-s3";
import { s3Client } from "../../../services/upload-config-sw";

export class CreateEmailConfigController {
  constructor(
    private readonly createEmailConfigUseCase: CreateEmailConfigUseCase
  ) {}

  async handle(request: Request, response: Response) {
    try {
      if (request.file) {
        // Gerando um nome único para o arquivo
        const fileKey = `${Date.now()}-${randomUUID()}-${request.file.originalname}`;
        const params = {
          Bucket: process.env.AWS_BUCKET_NAME!,
          Key: fileKey,
          Body: request.file.buffer,
          ContentType: request.file.mimetype,
        };
        await s3Client.send(new PutObjectCommand(params));
        // URL pública do arquivo
        const fileUrl = `https://${process.env.AWS_BUCKET_NAME}.s3.${process.env.AWS_REGION}.amazonaws.com/${fileKey}`;
        // Adiciona a URL ao body
        const paramsBody = { ...request.body, backgroundImageUrl: fileUrl };
        const parsedParams = createEmailConfigParamsSchema.parse(paramsBody);
        const emailConfig = await this.createEmailConfigUseCase.execute(parsedParams);
        return response.status(201).json(emailConfig);
      }
      // Se não houver arquivo, segue fluxo normal
      const params = createEmailConfigParamsSchema.parse(request.body);
      const emailConfig = await this.createEmailConfigUseCase.execute(params);
      return response.status(201).json(emailConfig);
    } catch (error) {
      const errorResponse = handleErrors(error);
      return response.status(errorResponse.statusCode).json(errorResponse.body);
    }
  }
} 