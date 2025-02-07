import { ZodError, ZodIssue } from "zod";
import { HttpTokenError } from "./errors-type/http-token-error";
import { HttpStandartError } from "./errors-type/htttp-standart-error";
import { HttpConflictError } from "./errors-type/htttp-conflict-error";
import { HttpBadRequestError } from "./errors-type/htttp-bad-request-error";
import { HttConfigurationError } from "./errors-type/http-configuration-error";
import { HttpResourceNotFoundError } from "./errors-type/http-resource-not-found-error";
import { HttDateEventAvailableError } from "./errors-type/http-date-not-available-error";
import { HttpInvalidCredentialsError } from "./errors-type/http-invalid-credentials-error";
import { PrismaClientKnownRequestError, PrismaClientValidationError } from "@prisma/client/runtime/library";

export const handleErrors = (error: any) => {
    // Verificar se o erro é uma das instâncias específicas
    if (
        error instanceof HttpTokenError ||
        error instanceof HttpStandartError ||
        error instanceof HttpConflictError ||
        error instanceof HttpBadRequestError ||
        error instanceof HttConfigurationError ||
        error instanceof HttpResourceNotFoundError ||
        error instanceof HttDateEventAvailableError ||
        error instanceof HttpInvalidCredentialsError
    ) {
        return {
            statusCode: error.statusCode,
            body: {
                title: error.name,
                message: error.message,
            }
        };
    }

    if (error instanceof ZodError) {
        // Extrai os erros do Zod

        const missingParams = error.issues.map((issue: ZodIssue) => {
            return `${issue.path.join(".")} - ${issue.message}`;
          }).join(", ")
        return {
            statusCode: 400,
            body: {
                title: `Erro na validacao dos parametros da requisicao`,
                message: missingParams
            }
        };
    }

    if (error instanceof PrismaClientKnownRequestError) {
        // Captura a mensagem de erro do Prisma
        const errorMessage = error.message;

        // Verifica se é um erro de chave duplicada
        if (error.code === "P2002") {
            // Extração apenas da mensagem de erro relevante
            const message = errorMessage.match(/Unique constraint failed on the constraint: `.*`/)?.[0] || "Erro desconhecido";

            return {
                statusCode: 409,
                body: {
                    title: error.name, // Nome do erro (PrismaClientKnownRequestError)
                    message: "ja existe",
                }
            };
        }

        if (error.code === "P2007") {
            const message = error.message || "Erro desconhecido";
            return {
                statusCode: 400,
                body: {
                    title: error.name,
                    message,
                }
            };
        }
    }

    if (error instanceof PrismaClientValidationError) {
        const match = error.message.match(/Unknown argument `.*?`\..*?\?/);
        const message = match ? match[0] : "Erro de validação desconhecido";
        return {
            statusCode: 400,
            body: {
                title: error.name,
                message,
            }
        };
    }
    // Resposta padrão para erros desconhecidos
    return {
        statusCode: 500,
        body: {
            title: "Server Error",
            message: error.toString(),
        }
    };
};