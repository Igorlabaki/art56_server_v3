import { ZodError, ZodIssue } from "zod";
import { HttpBadRequestError } from "./errors-type/htttp-bad-request-error";
import { HttpConflictError } from "./errors-type/htttp-conflict-error";
import { PrismaClientKnownRequestError, PrismaClientValidationError } from "@prisma/client/runtime/library";
import { HttConfigurationError } from "./errors-type/http-configuration-error";
import { HttpTokenError } from "./errors-type/http-token-error copy";

export const handleErrors = (error: any) => {
    // Verificar se o erro é uma das instâncias específicas
    if (error instanceof HttpBadRequestError || error instanceof HttpConflictError || error instanceof HttConfigurationError || error instanceof HttpTokenError) {
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
            throw new HttpConflictError(`${String(error.meta?.target).split("_")[1]}`);
        }

        if (error.code === "P2007") {
            throw new HttpBadRequestError(`${error.meta?.target}`);
        }
    }

    if (error instanceof PrismaClientValidationError) {
        throw new HttpBadRequestError(`${error.message}`);
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