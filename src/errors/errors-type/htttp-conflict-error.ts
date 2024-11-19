export class HttpConflictError extends Error {
    statusCode: number;
    name: string;
    message: string;
    
    constructor(message: string) {
        super(message);
        this.statusCode = 409;
        this.name = "Conflict";
        this.message = `${message} ja registrado.`;
    }
}