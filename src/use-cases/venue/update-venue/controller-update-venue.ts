import { Request, Response } from "express"
import { randomUUID } from "crypto";
import { PutObjectCommand, DeleteObjectCommand } from "@aws-sdk/client-s3";
import { s3Client } from "../../../services/upload-config-sw";
import { handleErrors } from "../../../errors/error-handler";
import { UpdateVenueUseCase } from "./use-case-update-venue";
import { VenueRepositoryInterface } from "../../../repositories/interface/venue-repository-interface";
import { HttpConflictError } from "../../../errors/errors-type/htttp-conflict-error";
import { updateVenueSchemaRequest } from "../../../zod/venue/update-venue-params-schema-db";

class UpdateVenueController {
    constructor(
        private updateVenueUseCase: UpdateVenueUseCase,
        private venueRepository: VenueRepositoryInterface
    ) { }

    async handle(req: Request, resp: Response) {
        try {
            const param = updateVenueSchemaRequest.parse(req.body);
            const { venueId, userId, logoUrl, hasOvernightStay, ...rest } = param;

            // Busca o venue atual para pegar a URL da imagem antiga
            const currentVenue = await this.venueRepository.getById({ venueId: param.venueId });

            if (!currentVenue) {
                throw new HttpConflictError("Venue não encontrada.");
            }

            let fileUrl: string | undefined = currentVenue.logoUrl || undefined;

            if (req.file) {
                // Se existe uma imagem antiga, deleta ela primeiro
                if (currentVenue.logoUrl) {
                    const fileKeyDelete = currentVenue.logoUrl.split("/").pop(); // Pega a chave do arquivo no S3
                    console.log("[UpdateVenue] Deletando imagem antiga do S3, key:", fileKeyDelete);

                    try {
                        await s3Client.send(
                            new DeleteObjectCommand({
                                Bucket: process.env.AWS_BUCKET_NAME!,
                                Key: fileKeyDelete!,
                            })
                        );
                        console.log("[UpdateVenue] Imagem antiga deletada com sucesso");
                    } catch (err) {
                        console.log("[UpdateVenue] Erro ao deletar imagem da aws:", err);
                        throw new HttpConflictError("Erro ao deletar imagem da aws.");
                    }
                }

                // Gerando um nome único para o arquivo
                const fileKeyUpload = `${param.name || currentVenue.name}-${randomUUID()}-${req.file.originalname}`;
                console.log("[UpdateVenue] Fazendo upload da nova imagem para o S3, key:", fileKeyUpload);

                const params = {
                    Bucket: process.env.AWS_BUCKET_NAME!,
                    Key: fileKeyUpload,
                    Body: req.file.buffer,
                    ContentType: req.file.mimetype,
                };

                await s3Client.send(new PutObjectCommand(params));
                console.log("[UpdateVenue] Upload da nova imagem concluído");

                // URL pública do arquivo
                fileUrl = `https://${process.env.AWS_BUCKET_NAME}.s3.${process.env.AWS_REGION}.amazonaws.com/${fileKeyUpload}`;
            }

            // Atualiza o venue com a nova URL da imagem
            const response = await this.updateVenueUseCase.execute({
                venueId: param.venueId,
                userId: param.userId,
                data: {
                    ...rest,
                    logoUrl: fileUrl,
                    hasOvernightStay: hasOvernightStay === "true" ? true : hasOvernightStay === "false" ? false : undefined
                }
            });

            return resp.json(response);
        } catch (error) {
            console.log("[UpdateVenue] Erro capturado:", error);
            const errorResponse = handleErrors(error);
            return resp.status(errorResponse.statusCode).json(errorResponse.body);
        }
    }
}
/* ehdiushduis */
export { UpdateVenueController }
