import { Request, Response } from "express"
import { handleErrors } from "../../../errors/error-handler";
import { GetUserVenuePermissionUseCase } from "./use-case-get-user-venue-permission-id";
import { getUserVenuePermissionSchema } from "../../../zod/user-venue-permission/get-user-venue-permission-params-schema";


class GetUserVenuePermissionController {
    constructor(private getUserVenuePermissionUseCase: GetUserVenuePermissionUseCase) { }
    async handle(req: Request, resp: Response) {
        try {
            const query = getUserVenuePermissionSchema.parse(req.query);
            const userVenuePermission = await this.getUserVenuePermissionUseCase.execute(query);
            
            return resp.json(userVenuePermission)
        } catch (error) {
            // Chamar o handleErrors para formatar o erro
            const errorResponse = handleErrors(error);

            // Retornar a resposta formatada
            return resp.status(errorResponse.statusCode).json(errorResponse.body);
        }
    }
}

export { GetUserVenuePermissionController }
