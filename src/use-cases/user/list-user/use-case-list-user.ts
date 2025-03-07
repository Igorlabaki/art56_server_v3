
import { UserRepositoryInterface } from "../../../repositories/interface/user-repository-interface";
import { ListUserRequestQuerySchema } from "../../../zod/user/list-user-query-schema";

class ListUsersUseCase {
  constructor(private userRepository: UserRepositoryInterface) { }

  async execute(query: ListUserRequestQuerySchema       ) {
    const userList = await this.userRepository.list(query);

    const formatedResponse = {
      success: true,
      message: `Lista de useros com ${userList?.length} items`,
      data: {
        userList: userList
      },
      count: userList?.length,
      type: "List"
    }

    return formatedResponse;
  }
}

export { ListUsersUseCase };
