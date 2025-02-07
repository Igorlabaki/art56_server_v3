export class HttpResourceNotFoundError extends Error {
    statusCode: number;
    name: string;
    message: string;
    
    constructor(message:string) {
        super(message);
        this.statusCode = 404;
        this.name = "Resource Not Found";
        this.message = `${message} nao encontrado`;
    }
}