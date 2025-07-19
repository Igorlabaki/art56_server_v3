import { Request, Response } from "express"
import { handleErrors } from "../../../errors/error-handler";
import { GetUserVenuePermissionByIdUseCase } from "./use-case-get-user-permission-id";
import { getByIdUserVenuePermissionSchema } from "../../../zod/user-venue-permission/get-by-id-user-venue-permission-params-schema";


class GetUserVenuePermissionByIdController {
    constructor(private getUserVenuePermissionByIdUseCase: GetUserVenuePermissionByIdUseCase) { }
    async handle(req: Request, resp: Response) {
        try {
            const query = getByIdUserVenuePermissionSchema.parse(req.query);
            const UserVenuePermissionById = await this.getUserVenuePermissionByIdUseCase.execute(query);
            
            return resp.json(UserVenuePermissionById)
        } catch (error) {
            // Chamar o handleErrors para formatar o erro
            const errorResponse = handleErrors(error);

            // Retornar a resposta formatada
            return resp.status(errorResponse.statusCode).json(errorResponse.body);
        }
    }
}

export { GetUserVenuePermissionByIdController }
