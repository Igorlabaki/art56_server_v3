import { Request, Response } from "express"
import { randomUUID } from "crypto";
import { PutObjectCommand, DeleteObjectCommand, ObjectCannedACL } from "@aws-sdk/client-s3";
import { s3Client } from "../../../services/upload-config-sw";
import { handleErrors } from "../../../errors/error-handler";
import { UpdatePaymentUseCase } from "./use-case-update-payment";
import { updatePaymentSchema } from "../../../zod/payment/update-payment-params-schema";
import { UpdateDocumentUseCase } from "../../document/update-document/use-case-update-document";
import { format, parse } from "date-fns";
import { DocumentRepositoryInterface } from "../../../repositories/interface/document-repository-interface";
import { PaymentRepositoryInterface } from "../../../repositories/interface/payment-repository-interface";
import { HttpConflictError } from "../../../errors/errors-type/htttp-conflict-error";

class UpdatePaymentController {
    constructor(
        private updatePaymentUseCase: UpdatePaymentUseCase,
        private updateDocumentUseCase: UpdateDocumentUseCase,
        private documentRepository: DocumentRepositoryInterface,
        private paymentRepository: PaymentRepositoryInterface
    ) { }

    async handle(req: Request, resp: Response) {
        try {
            const param = updatePaymentSchema.parse(req.body);

            if (req.file) {
                console.log("req.file", req.file);
                // Busca o pagamento atual para pegar a URL da imagem antiga
                const currentPayment = await this.paymentRepository.getById(param.paymentId);

                if (currentPayment?.imageUrl) {
                    const fileKeyDelete = currentPayment.imageUrl.split("/").pop(); // Pega a chave do arquivo no S3

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
                const fileKeyUpload = `${param.paymentDate}-${randomUUID()}-${req.file.originalname}`;

                const params = {
                    Bucket: process.env.AWS_BUCKET_NAME!,
                    Key: fileKeyUpload,
                    Body: req.file.buffer,
                    ContentType: req.file.mimetype,
                };

                await s3Client.send(new PutObjectCommand(params));

                // URL pública do arquivo
                const fileUrl = `https://${process.env.AWS_BUCKET_NAME}.s3.${process.env.AWS_REGION}.amazonaws.com/${fileKeyUpload}`;

                // Atualiza o pagamento com a nova URL da imagem
                const response = await this.updatePaymentUseCase.execute({
                    ...param,
                    imageUrl: fileUrl,
                    paymentMethod: param.paymentMethod,
                    paymentDate: param.paymentDate,
                    amount: param.amount
                });

                if (response.success && currentPayment?.imageUrl) {
                    // Busca o documento existente pelo paymentId
                    
                    const existingDocument = await this.documentRepository.getByPaymentId(response.data.id);

                    if (existingDocument) {
                        // Atualiza o documento existente
                        const parsedDate = parse(param.paymentDate, "dd/MM/yyyy", new Date());

                        await this.updateDocumentUseCase.execute({
                            documentId: existingDocument.id,
                            data: {
                                title: `Comprovante-${format(parsedDate, "dd/MM/yyyy")}`,
                                imageUrl: fileUrl
                            }
                        });
                    } else {
                        const parsedDate = parse(param.paymentDate, "dd/MM/yyyy", new Date());
                        // Se não encontrar o documento, cria um novo
                        await this.documentRepository.create({
                            paymentId: response.data.id,
                            imageUrl: fileUrl,
                            fileType: "IMAGE",
                            proposalId: param.proposalId,
                            title: `Comprovante-${format(parsedDate, "dd/MM/yyyy")}`
                        });
                    }
                }

                return resp.json(response);
            }

            const paymentById = await this.updatePaymentUseCase.execute(param);
            return resp.json(paymentById);
        } catch (error) {
            // Chamar o handleErrors para formatar o erro
            const errorResponse = handleErrors(error);

            // Retornar a resposta formatada
            return resp.status(errorResponse.statusCode).json(errorResponse.body);
        }
    }
}

export { UpdatePaymentController }
