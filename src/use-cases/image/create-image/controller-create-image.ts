import { randomUUID } from "crypto";
import { Request, Response } from "express";
import { PutObjectCommand } from "@aws-sdk/client-s3";
import sharp from "sharp";
import { CreateImageUseCase } from "./use-case-create-image";
import { handleErrors } from "../../../errors/error-handler";
import { s3Client } from "../../../services/upload-config-sw";
import { HttpConflictError } from "../../../errors/errors-type/htttp-conflict-error";
import { createImageRequestParams } from "../../../zod/image/create-image-params-schema";
import { ImageRepositoryInterface } from "../../../repositories/interface/image-repository-interface";
import { HttpResourceNotFoundError } from "../../../errors/errors-type/http-resource-not-found-error";
import { assertPhotoBelongsToVenue, VenuePhotoRef } from "../../../functions/venue-photo-ref";

class CreateImageController {
  constructor(
    private createImageUseCase: CreateImageUseCase,
    private imageRepository: ImageRepositoryInterface,
    private photos?: { getById: (id: string) => Promise<VenuePhotoRef | null> },
  ) {}

  async handle(req: Request, res: Response) {
    console.log("req.body", req.body);
    try {
      const parsed = createImageRequestParams.parse(req.body);
      const { position, tag, venueId } = parsed;

      if (tag) {
        const verifyImage = await this.imageRepository.verifyImage({
          tag,
          imageId: null,
          position: Number(position),
          venueId,
        });

        if (verifyImage) {
          throw new HttpConflictError(
            "Já existe uma imagem nessa posição desta tag."
          );
        }
      }

      if (parsed.photoId) {
        const photo = assertPhotoBelongsToVenue(await this.photos?.getById(parsed.photoId), venueId);
        const response = await this.createImageUseCase.execute({
          ...parsed,
          imageUrl: photo.url,
          photoId: photo.id,
        });
        return res.status(201).json(response);
      }

      if (!req.file) {
        throw new HttpResourceNotFoundError("Arquivo");
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
      const response = await this.createImageUseCase.execute({
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

export { CreateImageController };
