import { hash } from "bcryptjs"
import { HttpConflictError } from "../../../errors/errors-type/htttp-conflict-error";
import { UserRepositoryInterface } from "../../../repositories/interface/user-repository-interface";
import { CreateUserRequestParams } from "../../../zod/user/create-user-params-schema";
import { RegisterUserRequestParams } from "../../../zod/auth/register-user-params-schema";

class CreateNewUserUseCase {
  constructor(private userRepository: UserRepositoryInterface) { }

  async execute({email,password,username}: CreateUserRequestParams) {

    // Validate if user exists
    const userAlreadyExists = await this.userRepository.getByEmail(email)

    if (userAlreadyExists) {
      throw new HttpConflictError("Usuario")
    }
    //

    // Register new user
    const passwordHash = await hash(password, 8)

    const registerUserParams: RegisterUserRequestParams = {
      email,
      username,
      password: passwordHash,
    }

    const newUser = await this.userRepository.register(registerUserParams)

    const formatedResponse = {
      success: true,
      message: "Usuario foi registrado com sucesso",
      data: {
        ...newUser
      },
      count: 1,
      type: "User"
    }

    return formatedResponse
  }
}

export { CreateNewUserUseCase };
