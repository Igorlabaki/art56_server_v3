import { randomUUID } from "crypto";
import { Request, Response } from "express";
import { PutObjectCommand } from "@aws-sdk/client-s3";
import sharp from "sharp";
import { CreateImageOrganizationUseCase } from "./use-case-create-image-organization";
import { handleErrors } from "../../../errors/error-handler";
import { s3Client } from "../../../services/upload-config-sw";
import { HttpConflictError } from "../../../errors/errors-type/htttp-conflict-error";
import { ImageRepositoryInterface } from "../../../repositories/interface/image-repository-interface";
import { HttpResourceNotFoundError } from "../../../errors/errors-type/http-resource-not-found-error";
import { createImageOrganizationRequestParams } from "../../../zod/image-organization/create-image-organization-params-schema";

class CreateImageOrganizationController {
  constructor(
    private createImageOrganizationUseCase: CreateImageOrganizationUseCase,
    private imageRepository: ImageRepositoryInterface
  ) {}

  async handle(req: Request, res: Response) {
    console.log("req.body", req.body);
    try {
      if (!req.file) {
        throw new HttpResourceNotFoundError("Arquivo");
      }

      console.log("✅ Arquivo recebido:", req.file.originalname);

      // Valida os dados recebidos
      createImageOrganizationRequestParams.parse(req.body);

      const { position, tag, organizationId } = req.body;

      // Verifica se já existe uma imagem na posição/tag
      if (tag) {
        const verifyImage = await this.imageRepository.verifyImageOrganization({
          tag,
          imageId: null,
          position: Number(position),
          organizationId,
        });
        console.log({
          tag,
          imageId: null,
          position: Number(position),
          organizationId,
        })
        console.log(verifyImage)
        if (verifyImage) {
          throw new HttpConflictError(
            "Já existe uma imagem nessa posição desta tag."
          );
        }
      }

      // Gera um nome único para o arquivo no formato WebP
      const fileKey = `${Date.now()}-${randomUUID()}.webp`;
      console.log("📌 Nome do arquivo gerado:", fileKey);

      // Converte a imagem para WebP antes de enviar ao S3
      const webpBuffer = await sharp(req.file.buffer)
        .resize({ width: 1200 }) // Redimensiona para largura máxima de 1200px (ajustável)
        .webp({ quality: 80 }) // Converte para WebP com qualidade 80%
        .toBuffer();

      console.log("🎯 Conversão para WebP concluída. Tamanho:", webpBuffer.length);

      const params = {
        Bucket: process.env.AWS_BUCKET_NAME!,
        Key: fileKey,
        Body: webpBuffer,
        ContentType: "image/webp",
      };

      console.log("🚀 Parâmetros do S3 prontos:", params);

      // Upload para S3
      await s3Client.send(new PutObjectCommand(params));

      console.log("✅ Upload para AWS S3 concluído!");

      // URL pública do arquivo
      const fileUrl = `https://${process.env.AWS_BUCKET_NAME}.s3.${process.env.AWS_REGION}.amazonaws.com/${fileKey}`;

      console.log("🔗 URL gerada:", fileUrl);

      // Salva no banco com a URL da imagem
      const response = await this.createImageOrganizationUseCase.execute({
        ...req.body,
        imageUrl: fileUrl,
      });

      console.log("💾 Imagem salva no banco com sucesso!");

      return res.status(201).json(response);
    } catch (error) {
      console.error("❌ Erro no upload da imagem:", error);
      const errorResponse = handleErrors(error);
      res.status(errorResponse.statusCode).json(errorResponse.body);
    }
  }
}

export { CreateImageOrganizationController };
