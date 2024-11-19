import { hash } from "bcryptjs"

import { UpdateUserPasswordRequestParams } from "../../../zod/update-user-password-params-schema"
import { UserRepositoryInterface } from "../../../repositories/interface/user-repository-interface"
import { HttpResourceNotFoundError } from "../../../errors/errors-type/http-resource-not-found-error"

class UpdateUserPasswordCase{

    constructor(
        private userRepository: UserRepositoryInterface,
    ) { }

    async execute({password , email} : UpdateUserPasswordRequestParams){

        // Validate if user exists
            const userAlreadyExists = await this.userRepository.getByEmail(email)

            if(!userAlreadyExists){
                throw new HttpResourceNotFoundError("Usuario")
            }
        //

        // Update userpassword user
            const passwordHash = await hash(password, 8)

            const userInput: UpdateUserPasswordRequestParams = {
                email,         
                password: passwordHash
            }

            await this.userRepository.updatePassword(userInput)
        //

        return 
    }
}

export {UpdateUserPasswordCase}