import { Request, Response } from "express";
import { UpdateEmailConfigUseCase } from "./update-email-config-use-case";
import { updateEmailConfigParamsSchema } from "../../../zod/email-config/update-email-config-params-schema";
import { handleErrors } from "../../../errors/error-handler";
import { randomUUID } from "crypto";
import { PutObjectCommand, DeleteObjectCommand } from "@aws-sdk/client-s3";
import { s3Client } from "../../../services/upload-config-sw";

export class UpdateEmailConfigController {
  constructor(
    private readonly updateEmailConfigUseCase: UpdateEmailConfigUseCase
  ) {}

  async handle(request: Request, response: Response) {
    try {
      let paramsBody = { ...request.body };
      if (request.file) {
        // Se já existe uma imagem, deleta do S3
        if (request.body.backgroundImageUrl) {
          const fileKeyDelete = request.body.backgroundImageUrl.split("/").pop();
          await s3Client.send(new DeleteObjectCommand({
            Bucket: process.env.AWS_BUCKET_NAME!,
            Key: fileKeyDelete!,
          }));
        }
        // Faz upload do novo arquivo
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
        paramsBody = { ...paramsBody, backgroundImageUrl: fileUrl };
      }
      const params = updateEmailConfigParamsSchema.parse(paramsBody);
      const emailConfig = await this.updateEmailConfigUseCase.execute(params);
      return response.status(200).json(emailConfig);
    } catch (error) {
      const errorResponse = handleErrors(error);
      return response.status(errorResponse.statusCode).json(errorResponse.body);
    }
  }
} 