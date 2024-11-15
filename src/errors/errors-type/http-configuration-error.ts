export class HttConfigurationError extends Error {
    statusCode: number;
    name: string;
    message: string;
    
    constructor(message: string) {
        super(message);
        this.statusCode = 500;
        this.name = "Configuration Error";
        this.message = "Erro ao gerar o token";
    }
}