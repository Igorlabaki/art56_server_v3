import { Response } from "express";
import { handleErrors } from "../../../errors/error-handler";
import { uploadServiceImage } from "../../../functions/service-image-storage";
import { AuthenticatedRequest } from "../../../types/authenticated-request";
import { updateServiceSchema } from "../../../zod/services/update-service-params-schema";
import { UpdateServiceUseCase } from "./use-case-update-service";

class UpdateServiceController {
    constructor(private updateServiceUseCase: UpdateServiceUseCase) { }

    async handle(req: AuthenticatedRequest, resp: Response) {
        try {
            const param = updateServiceSchema.parse(readServiceBody(req.body));
            if (req.file) {
                param.data.imageUrl = await uploadServiceImage(req.file);
                param.data.removeImage = false;
            }
            const response = await this.updateServiceUseCase.execute(req.user?.id, param);
            return resp.json(response);
        } catch (error) {
            const errorResponse = handleErrors(error);
            return resp.status(errorResponse.statusCode).json(errorResponse.body);
        }
    }
}

export { UpdateServiceController };

function readServiceBody(body: unknown) {
    if (body && typeof body === "object" && "payload" in body && typeof (body as { payload?: unknown }).payload === "string") {
        return JSON.parse((body as { payload: string }).payload);
    }
    return body;
}
