import { S3Client, DeleteObjectCommand } from "@aws-sdk/client-s3";
import { ImageRepositoryInterface } from "../../../repositories/interface/image-repository-interface";
import { HttpResourceNotFoundError } from "../../../errors/errors-type/http-resource-not-found-error";
import { s3Client } from "../../../service/upload-config-sw";

class DeleteImageUseCase {
    constructor(private imageRepository: ImageRepositoryInterface) { }

    async execute(imageId: string) {

        // Validate if image exists
        const image = await this.imageRepository.getById(imageId)

        if (!image) {
            throw new HttpResourceNotFoundError("Imagem")
        }
        //

        const deletedImage = await this.imageRepository.delete(imageId)

        const fileKey = image.imageUrl.split("/").pop(); // Pega a chave do arquivo no S3
        await s3Client.send(
            new DeleteObjectCommand({
                Bucket: process.env.AWS_BUCKET_NAME!,
                Key: fileKey!,
            })
        );

        const formatedResponse = {
            success: true,
            message: `Imagem deletada com sucesso`,
            data: {
                ...deletedImage
            },
            count: 1,
            type: "Image"
        }

        return formatedResponse
    }
}

export { DeleteImageUseCase }
