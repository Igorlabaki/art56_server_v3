export class HttpBadRequestError extends Error {
    statusCode: number;
    name: string;
    message: string;
    
    constructor(message: string) {
        super(message);
        this.statusCode = 400;
        this.name = "Bad Request";
        this.message = message;
    }
}