import { Request, Response } from "express"
import { handleErrors } from "../../../errors/error-handler";
import { DeleteUserVenuePermissionUseCase } from "./use-case-delete-user-venue-permission";
import { deleteUserVenuePermissionRequestParamSchema } from "../../../zod/user-venue-permission/delete-user-venue-permission-param-schema";

class DeleteUserVenuePermissionController {
    constructor(private deleteUserVenuePermissionUseCase: DeleteUserVenuePermissionUseCase) { }
    async handle(req: Request, resp: Response) {
        try {
            const param = deleteUserVenuePermissionRequestParamSchema.parse(req.params);
            const userVenuePermissionById = await this.deleteUserVenuePermissionUseCase.execute(param);
            return resp.status(200).json(userVenuePermissionById);
        } catch (error) {
            // Chamar o handleErrors para formatar o erro
            const errorResponse = handleErrors(error);

            // Retornar a resposta formatada
            return resp.status(errorResponse.statusCode).json(errorResponse.body);
        }
    }
}

export { DeleteUserVenuePermissionController }
