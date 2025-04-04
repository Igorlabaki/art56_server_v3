export class HttpTokenError extends Error {
    statusCode: number;
    name: string;
    message: string;
    
    constructor() {
        super();
        this.statusCode = 401;
        this.name = "Token Error";
        this.message = "Erro ao gerar novo token";
    }
}