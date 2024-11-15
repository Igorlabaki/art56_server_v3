import { HttpBadRequestError } from "../errors-type/htttp-bad-request-error";

export function validateParams<T extends Record<string, any>>(params: T, expectedType: T) {
    // Verifica se os parâmetros são um objeto
    if (typeof params !== 'object' || params === null) {
        throw new HttpBadRequestError('Parâmetros inválidos: O valor fornecido não é um objeto.');
    }

    const keys = Object.keys(expectedType);
    for (const key of keys) {
        // Verifica se a chave está presente nos parâmetros
        if (!(key in params)) {
            throw new HttpBadRequestError(`Parâmetro ausente: '${key}' é obrigatório.`);
        }

        const paramValue = params[key];
        const expectedValue = expectedType[key];

        // Verifica se o tipo do parâmetro é correto
        if (typeof paramValue !== typeof expectedValue) {
            throw new HttpBadRequestError(`Tipo inválido para '${key}': Esperado ${typeof expectedValue}, mas recebeu ${typeof paramValue}.`);
        }
    }
}