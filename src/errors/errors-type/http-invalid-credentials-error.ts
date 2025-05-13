export class HttpInvalidCredentialsError extends Error {
    statusCode: number;
    name: string;
    message: string;
    
    constructor(message?: string) {
        super();
        this.statusCode = 404;
        this.name = "Invalid credentials";
        this.message = message || `Email ou senha estao incorretos.`;
    }
}