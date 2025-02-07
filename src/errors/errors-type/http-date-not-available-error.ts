export class HttDateEventAvailableError extends Error {
    statusCode: number;
    name: string;
    message: string;
    
    constructor(message?: string) {
        super(message);
        this.statusCode = 409;
        this.name = "Date conflict";
        this.message = message ? message :  "Data nao esta disponivel";
    }
}