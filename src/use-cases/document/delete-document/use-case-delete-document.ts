
import { DeleteObjectCommand } from "@aws-sdk/client-s3";
import { s3Client } from "../../../service/upload-config-sw";
import { DeleteDocumentRequestParamSchema } from "../../../zod/document/delete-document-param-schema";
import { HttpResourceNotFoundError } from "../../../errors/errors-type/http-resource-not-found-error";
import { DocumentRepositoryInterface } from "../../../repositories/interface/document-repository-interface";
import { PaymentRepositoryInterface } from "../../../repositories/interface/payment-repository-interface";
import { ProposalRepositoryInterface } from "../../../repositories/interface/proposal-repository-interface";
class DeleteDocumentUseCase {
    constructor(
        private documentRepository: DocumentRepositoryInterface, 
        private paymentRepository: PaymentRepositoryInterface, 
        private proposalRepository: ProposalRepositoryInterface
    ) { }

    async execute({ documentId }: DeleteDocumentRequestParamSchema) {

        // Validate if document exists
        const document = await this.documentRepository.getById(documentId)

        if (!document) {
            throw new HttpResourceNotFoundError("Documento")
        }
        //

        const deletedDocument = await this.documentRepository.delete(documentId)

        if (deletedDocument?.paymentId) {
            const deletedPayment = await this.paymentRepository.delete(deletedDocument.paymentId)

            if(!deletedPayment){
                throw new HttpResourceNotFoundError("Pagamento")
            }

            const proposal = await this.proposalRepository.getById(deletedPayment.proposalId)

            if (!proposal) {
                throw new HttpResourceNotFoundError("Orcamento")
            }

            await this.proposalRepository.update({
                proposalId: proposal.id,
                data: {
                    amountPaid: (proposal.amountPaid || 0) - deletedPayment.amount
                }
            })
        }

        const fileKey = deletedDocument?.imageUrl.split("/").pop(); // Pega a chave do arquivo no S3
        await s3Client.send(
            new DeleteObjectCommand({
                Bucket: process.env.AWS_BUCKET_NAME!,
                Key: fileKey!,
            })
        );

        const formatedResponse = {
            success: true,
            message: `Documento deletado com sucesso`,
            data: {
                ...deletedDocument
            },
            count: 1,
            type: "Document"
        }

        return formatedResponse
    }
}

export { DeleteDocumentUseCase }
