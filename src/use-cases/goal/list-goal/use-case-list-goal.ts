import { ListGoalRequestQuerySchema } from "../../../zod/goal/list-goal-query-schema";
import { GoalRepositoryInterface } from "../../../repositories/interface/goal-repository-interface";

class ListGoalsUseCase {
  constructor(private goalRepository: GoalRepositoryInterface) { }

  async execute(query: ListGoalRequestQuerySchema) {
    const goalList = await this.goalRepository.list(query);

    const formatedResponse = {
      success: true,
      message: `Lista de perguntas com ${goalList?.length} items`,
      data: {
        goalList: goalList
      },
      count: goalList?.length,
      type: "List"
    }

    return formatedResponse;
  }
}

export { ListGoalsUseCase };
