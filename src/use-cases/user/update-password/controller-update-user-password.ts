import { Request, Response } from "express"
import { UpdateUserPasswordCase } from "./use-case-update-user-password"
import { UpdateUserPasswordRequestParams, updateUserPasswordSchema } from "../../../zod/auth/update-user-password-params-schema";


class UpdateUserPasswordController {
    constructor(private updatePasswordUseCase: UpdateUserPasswordCase) { }
    async handle(req: Request, resp: Response) {

        const body: UpdateUserPasswordRequestParams = req.body

        updateUserPasswordSchema.parse(body);


        const userByid = this.updatePasswordUseCase.execute(body)

        return resp.json(userByid)
    }
}

export { UpdateUserPasswordController }
