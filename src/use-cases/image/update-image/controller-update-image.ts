import { randomUUID } from "crypto";
import { Request, Response } from "express"
import { handleErrors } from "../../../errors/error-handler";
import { s3Client } from "../../../service/upload-config-sw";
import { DeleteObjectCommand, PutObjectCommand } from "@aws-sdk/client-s3";
import { UpdateImageUseCase } from "../../image/update-image/use-case-update-image";
import { HttpConflictError } from "../../../errors/errors-type/htttp-conflict-error";
import { ImageRepositoryInterface } from "../../../repositories/interface/image-repository-interface";
import { UpdateImageRequestParams, updateImageRequestParams } from "../../../zod/image/upload-image-params-schema";
import { HttpResourceNotFoundError } from "../../../errors/errors-type/http-resource-not-found-error";

class UpdateImageController {
    constructor(private updateImageUseCase: UpdateImageUseCase, private imageRepository: ImageRepositoryInterface) { }
    async handle(req: Request, res: Response) {
        try {
            if (!req.file) {
                try {
                    const param = updateImageRequestParams.parse(req.body);

                    const { position, tag, imageId } = param;

                    // Verifica se já existe uma imagem na posição/tag
                    if (tag) {
                        const verifyImage = await this.imageRepository.verifyImage({
                            tag,
                            imageId,
                            position: Number(position),
                        });
                        if (verifyImage) {
                            throw new HttpConflictError("Já existe uma imagem nessa posição desta tag.");
                        }
                    }

                    const response = await this.updateImageUseCase.execute(param);

                    return res.json(response)
                } catch (error) {
                    // Chamar o handleErrors para formatar o erro
                    const errorResponse = handleErrors(error);

                    // Retornar a resposta formatada
                    return res.status(errorResponse.statusCode).json(errorResponse.body);
                }
            }

            // Valida os dados recebidos
            updateImageRequestParams.parse(req.body);

            const body: UpdateImageRequestParams = req.body;

            const { position, tag, imageId } = body;

            // Validate if image exists
            const image = await this.imageRepository.getById(imageId)

            if (!image) {
                throw new HttpResourceNotFoundError("Imagem")
            }
            //

            // Verifica se já existe uma imagem na posição/tag
            if (tag) {
                const verifyImage = await this.imageRepository.verifyImage({
                    tag,
                    imageId,
                    position: Number(position),
                });

                if (verifyImage) {
                    throw new HttpConflictError("Já existe uma imagem nessa posição desta tag.");
                }
            }

            const fileKeyDelete = image.imageUrl.split("/").pop(); // Pega a chave do arquivo no S3

            const imageDeleted = await s3Client.send(
                new DeleteObjectCommand({
                    Bucket: process.env.AWS_BUCKET_NAME!,
                    Key: fileKeyDelete!,
                })
            );

            if (!imageDeleted) {
                throw new HttpConflictError("Erro ao deletar imagem da aws.");
            }

            const fileKeyUpload = `${Date.now()}-${randomUUID()}-${req.file.originalname}`;

            const params = {
                Bucket: process.env.AWS_BUCKET_NAME!,
                Key: fileKeyUpload,
                Body: req.file.buffer,
                ContentType: req.file.mimetype,
            };

            await s3Client.send(new PutObjectCommand(params));

            // URL pública do arquivo
            const fileUrl = `https://${process.env.AWS_BUCKET_NAME}.s3.${process.env.AWS_REGION}.amazonaws.com/${fileKeyUpload}`;
        
            // Salva no banco com a URL da imagem
            const response = await this.updateImageUseCase.execute({ ...req.body, imageUrl: fileUrl });

            res.status(201).json(response);
        } catch (error) {
            const errorResponse = handleErrors(error);
            res.status(errorResponse.statusCode).json(errorResponse.body);
        }
    }
}

export { UpdateImageController }
