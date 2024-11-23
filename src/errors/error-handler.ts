import { ZodError, ZodIssue } from "zod";
import { HttpBadRequestError } from "./errors-type/htttp-bad-request-error";
import { HttpConflictError } from "./errors-type/htttp-conflict-error";
import { PrismaClientKnownRequestError, PrismaClientValidationError } from "@prisma/client/runtime/library";
import { HttConfigurationError } from "./errors-type/http-configuration-error";
import { HttpTokenError } from "./errors-type/http-token-error";
import { HttpInvalidCredentialsError } from "./errors-type/http-invalid-credentials-error";

export const handleErrors = (error: any) => {
    // Verificar se o erro é uma das instâncias específicas
    if (
        error instanceof HttpTokenError ||
        error instanceof HttpConflictError ||
        error instanceof HttpBadRequestError ||
        error instanceof HttConfigurationError ||
        error instanceof HttpInvalidCredentialsError
    ) {
        return {
            statusCode: error.statusCode,
            body: {
                errors: [
                    {
                        title: error.name,
                        detail: error.message,
                    }
                ]
            }
        };
    }

    if (error instanceof ZodError) {
        // Extrai os erros do Zod
        const zodErrors = (error as ZodError).issues.map((issue: ZodIssue) => ({
            path: issue.path.join("."),
            message: issue.message,
        }));

        // Retorna uma resposta com os erros formatados
        return {
            statusCode: 400,
            body: {
                errors: zodErrors
            }
        };
    }

    if (error instanceof PrismaClientKnownRequestError) {
        // Captura a mensagem de erro do Prisma
        const errorMessage = error.message;

        // Verifica se é um erro de chave duplicada
        if (error.code === "P2002") {
            // Extração apenas da mensagem de erro relevante
            const detail = errorMessage.match(/Unique constraint failed on the constraint: `.*`/)?.[0] || "Erro desconhecido";

            return {
                statusCode: 409,
                body: {
                    errors: [
                        {
                            title: error.name, // Nome do erro (PrismaClientKnownRequestError)
                            detail, // Detalhe extraído (apenas a mensagem relevante)
                        }
                    ]
                }
            };
        }

        if (error.code === "P2007") {
            const detail = error.message || "Erro desconhecido";
            return {
                statusCode: 400,
                body: {
                    errors: [
                        {
                            title: error.name,
                            detail: detail,
                        }
                    ]
                }
            };
        }
    }

    if (error instanceof PrismaClientValidationError) {
        const match = error.message.match(/Unknown argument `.*?`\..*?\?/);
        const detail = match ? match[0] : "Erro de validação desconhecido";
        return {
            statusCode: 400,
            body: {
                errors: [
                    {
                        title: error.name,
                        detail: detail,
                    }
                ]
            }
        };
    }
    // Resposta padrão para erros desconhecidos
    return {
        statusCode: 500,
        body: {
            errors: [
                {
                    title: "Server Error",
                    detail: error.toString(),
                }
            ]
        }
    };
};