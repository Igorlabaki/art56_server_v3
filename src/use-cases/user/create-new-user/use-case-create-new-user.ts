import { HttpConflictError } from "../../../errors/errors-type/htttp-conflict-error";
import { UserRepositoryInterface } from "../../../repositories/interface/user-repository-interface";
import { CreateUserRequestParams } from "../../../zod/user/create-user-params-schema";

class CreateNewUserUseCase {
  constructor(private userRepository: UserRepositoryInterface) {}

  async execute(params: CreateUserRequestParams) {

    const newUser = await this.userRepository.register(params);

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
