import { randomUUID } from "crypto";
import { Request, Response } from "express"
import { handleErrors } from "../../../errors/error-handler";
import { s3Client } from "../../../service/upload-config-sw";
import { UpdateImageUseCase } from "../../image/update-image/use-case-update-image";
import { HttpConflictError } from "../../../errors/errors-type/htttp-conflict-error";
import { updateImageRequestParams } from "../../../zod/image/upload-image-params-schema";
import { ImageRepositoryInterface } from "../../../repositories/interface/image-repository-interface";

class UpdateImageController {
    constructor(private updateImageUseCase: UpdateImageUseCase, private imageRepository: ImageRepositoryInterface) { }
    async handle(req: Request, res: Response) {
        try {
            if (!req.file) {
                return res.status(400).json({ error: "Arquivo não enviado." });
            }

            // Valida os dados recebidos
            const teste = updateImageRequestParams.safeParse(req.body);
            console.log(teste)
            const { position, tag } = req.body;

            // Verifica se já existe uma imagem na posição/tag
            if (tag) {
                const verifyImage = await this.imageRepository.verifyImage({
                    position: Number(position),
                    tag,
                });
                console.log(verifyImage)
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
            console.log("fileUrl", fileUrl)
            // Salva no banco com a URL da imagem
            const response = await this.updateImageUseCase.execute({ ...req.body, imageUrl: fileUrl });
            console.log(response)
            res.status(201).json(response);
        } catch (error) {
            const errorResponse = handleErrors(error);
            res.status(errorResponse.statusCode).json(errorResponse.body);
        }
    }
}

export { UpdateImageController }
