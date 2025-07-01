import { Request, Response } from "express"

import { handleErrors } from "../../../errors/error-handler";

import { updateOwnerSchema } from "../../../zod/owner/update-owner-params-schema";
import { UpdateVenueOrganizationImageUseCase } from "./use-case-update-venue-organization-image";
import { updateImageOrganizationRequestSchema } from "../../../zod/organization/update-image-organization-request-schema";
class UpdateVenueOrganizationImageController {
    constructor(private updateVenueOrganizationImageUseCase: UpdateVenueOrganizationImageUseCase) { }
    async handle(req: Request, resp: Response) {
        try {
            const param = updateImageOrganizationRequestSchema.parse(req.body);

            const ownerById = await this.updateVenueOrganizationImageUseCase.execute(param);
            
            return resp.json(ownerById)
        } catch (error) {
            // Chamar o handleErrors para formatar o erro
            const errorResponse = handleErrors(error);

            // Retornar a resposta formatada
            return resp.status(errorResponse.statusCode).json(errorResponse.body);
        }
    }
}

export { UpdateVenueOrganizationImageController }
