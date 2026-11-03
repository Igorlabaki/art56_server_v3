export class HttpForbiddenError extends Error {
    statusCode: number;
    name: string;
    message: string;

    constructor(message: string) {
        super(message);
        this.statusCode = 403;
        this.name = "Forbidden";
        this.message = message;
    }
}
