import { randomUUID } from "crypto";
import { Request, Response } from "express";
import {  PutObjectCommand } from "@aws-sdk/client-s3";
import { CreateImageUseCase } from "./use-case-create-image";
import { handleErrors } from "../../../errors/error-handler";
import { s3Client } from "../../../service/upload-config-sw";
import { HttpConflictError } from "../../../errors/errors-type/htttp-conflict-error";
import { createImageRequestParams } from "../../../zod/image/create-image-params-schema";
import { ImageRepositoryInterface } from "../../../repositories/interface/image-repository-interface";
import { HttpResourceNotFoundError } from "../../../errors/errors-type/http-resource-not-found-error";

class CreateImageController {
  constructor(private createImageUseCase: CreateImageUseCase,private imageRepository: ImageRepositoryInterface) {}

  async handle(req: Request, res: Response) {
    try {
      if (!req.file) {
        throw new HttpResourceNotFoundError("Arquivo");
      }

      // Valida os dados recebidos
      const teste = createImageRequestParams.safeParse(req.body);

      const { position, tag, venueId } = req.body;

      // Verifica se já existe uma imagem na posição/tag
      if (tag) {
        const verifyImage = await this.imageRepository.verifyImage({
          tag,
          imageId: null,
          position: Number(position),
          venueId
        });

        if (verifyImage) {
          throw new HttpConflictError("Já existe uma imagem nessa posição desta tag.");
        }
      }
      
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
      const response = await this.createImageUseCase.execute({ ...req.body, imageUrl: fileUrl });
      return res.status(201).json(response);
    } catch (error) {
      const errorResponse = handleErrors(error);
      res.status(errorResponse.statusCode).json(errorResponse.body);
    }
  }
}

export { CreateImageController };