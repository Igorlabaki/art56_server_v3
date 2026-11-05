import { Response } from "express";
import { handleErrors } from "../../../errors/error-handler";
import { uploadServiceImage } from "../../../functions/service-image-storage";
import { AuthenticatedRequest } from "../../../types/authenticated-request";
import { createServiceSchema } from "../../../zod/services/create-service-params-schema";
import { CreateServiceUseCase } from "./use-case-create-service";

class CreateServiceController {
    constructor(private createServiceUseCase: CreateServiceUseCase) { }

    async handle(req: AuthenticatedRequest, resp: Response) {
        try {
            const body = createServiceSchema.parse(readServiceBody(req.body));
            body.imageUrl = req.file ? await uploadServiceImage(req.file) : null;
            const response = await this.createServiceUseCase.execute(req.user?.id, body);
            return resp.status(201).json(response);
        } catch (error) {
            const errorResponse = handleErrors(error);
            return resp.status(errorResponse.statusCode).json(errorResponse.body);
        }
    }
}

export { CreateServiceController };

function readServiceBody(body: unknown) {
    if (body && typeof body === "object" && "payload" in body && typeof (body as { payload?: unknown }).payload === "string") {
        return JSON.parse((body as { payload: string }).payload);
    }
    return body;
}
