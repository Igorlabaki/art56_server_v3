import { Request, Response } from "express"
import { GetUserByIdUseCase } from "./use-case-get-user-by-id"

class GetUserByIdController {
    constructor(private getUserByIdUseCase: GetUserByIdUseCase) { }
    async handle(req: Request, resp: Response) {

        const { userId } = req.params

        const userByid = this.getUserByIdUseCase.execute(userId)

        return resp.json(userByid)
    }
}

export { GetUserByIdController }
