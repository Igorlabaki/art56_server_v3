export class HttpInvalidCredentialsError extends Error {
    statusCode: number;
    name: string;
    message: string;
    
    constructor() {
        super();
        this.statusCode = 404;
        this.name = "Invalid credentials";
        this.message = `Usuario ou senha estao incorretos.`;
    }
}