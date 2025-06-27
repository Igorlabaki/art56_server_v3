import { Request, Response } from "express"

import { handleErrors } from "../../../errors/error-handler";
import { UpdateOrganizationUseCase } from "./use-case-update-organization";
import { updateOrganizationSchema } from "../../../zod/organization/update-organization-params-schema";
import { updateOrganizationRequestSchema } from "../../../zod/organization/update-organization-request-schema";
import { randomUUID } from "node:crypto";
import { s3Client } from "../../../services/upload-config-sw";
import { HttpConflictError } from "../../../errors/errors-type/htttp-conflict-error";   
import { OrganizationRepositoryInterface } from "../../../repositories/interface/organization-repository-interface";
import { PutObjectCommand, DeleteObjectCommand } from "@aws-sdk/client-s3";

class UpdateOrganizationController {
    constructor(private updateOrganizationUseCase: UpdateOrganizationUseCase, private organizationRepository: OrganizationRepositoryInterface) { }
    async handle(req: Request, resp: Response) {
        try {
            const param = updateOrganizationRequestSchema.parse(req.body);

            const { organizationId,logoUrl, ...data } = param;

            if (req.file) {
                console.log("req.file", req.file);
                // Busca o venue atual para pegar a URL da imagem antiga
                const currentOrganization = await this.organizationRepository.getById({ organizationId: param.organizationId });

                if (currentOrganization?.logoUrl) {
                    const fileKeyDelete = currentOrganization.logoUrl.split("/").pop(); // Pega a chave do arquivo no S3

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
                const response = await this.updateOrganizationUseCase.execute({
                    organizationId: param.organizationId,
                    data: {
                        ...data,
                        logoUrl: fileUrl,
                    }
                });

                return resp.json(response);
            }

            const organizationById = await this.updateOrganizationUseCase.execute({ organizationId, data });

            return resp.json(organizationById)
        } catch (error) {
            // Chamar o handleErrors para formatar o erro
            const errorResponse = handleErrors(error);

            // Retornar a resposta formatada
            return resp.status(errorResponse.statusCode).json(errorResponse.body);
        }
    }
}

export { UpdateOrganizationController }
