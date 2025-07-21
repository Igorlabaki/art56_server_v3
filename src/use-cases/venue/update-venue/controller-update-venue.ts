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
            const { venueId, userId, logoUrl, hasOvernightStay,owners,isShowOnOrganization, ...rest } = param;

            if (req.file) {
                console.log("req.file", req.file);
                // Busca o venue atual para pegar a URL da imagem antiga
                const currentVenue = await this.venueRepository.getById({ venueId: param.venueId });

                if (currentVenue?.logoUrl) {
                    const fileKeyDelete = currentVenue.logoUrl.split("/").pop(); // Pega a chave do arquivo no S3

                    const imageDeleted = await s3Client.send(
                        new DeleteObjectCommand({
                            Bucket: process.env.AWS_BUCKET_NAME!,
                            Key: fileKeyDelete!,
                        })
                    );

                    if (!imageDeleted) {
                        throw new HttpConflictError("Erro ao deletar imagem da aws.");
                    }
                }

                // Gerando um nome único para o arquivo
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

                // Atualiza o venue com a nova URL da imagem
                const response = await this.updateVenueUseCase.execute({
                    venueId: param.venueId,
                    userId: param.userId,
                    data: {
                        ...rest,
                        owners: owners ? JSON.parse(owners) : undefined,
                        isShowOnOrganization: isShowOnOrganization === "true" ? true : isShowOnOrganization === "false" ? false : undefined,
                        logoUrl: fileUrl,
                        hasOvernightStay: hasOvernightStay === "true" ? true : hasOvernightStay === "false" ? false : undefined
                    }
                });

                return resp.json(response);
            }

            const venueById = await this.updateVenueUseCase.execute({
                venueId: param.venueId,
                userId: param.userId,
                data: {
                    ...rest,
                    owners: owners ? JSON.parse(owners) : undefined,
                    isShowOnOrganization: isShowOnOrganization === "true" ? true : isShowOnOrganization === "false" ? false : undefined,
                    hasOvernightStay: hasOvernightStay === "true" ? true : hasOvernightStay === "false" ? false : undefined
                }
            });
            return resp.json(venueById);
        } catch (error) {
            console.log("error", error)
            // Chamar o handleErrors para formatar o erro
            const errorResponse = handleErrors(error);

            // Retornar a resposta formatada
            return resp.status(errorResponse.statusCode).json(errorResponse.body);
        }
    }
}

export { UpdateVenueController }
