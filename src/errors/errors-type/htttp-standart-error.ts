export class HttpStandartError extends Error {
    statusCode: number;
    name: string;
    message: string;
    
    constructor(message: string) {
        super(message);
        this.statusCode = 400;
        this.name = "Erro personalizado";
        this.message = message;
    }
}