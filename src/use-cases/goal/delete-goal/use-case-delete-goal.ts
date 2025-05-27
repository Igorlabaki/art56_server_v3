
import { DeleteGoalRequestParamSchema } from "../../../zod/goal/delete-goal-param-schema"
import { GoalRepositoryInterface } from "../../../repositories/interface/goal-repository-interface"
import { HttpResourceNotFoundError } from "../../../errors/errors-type/http-resource-not-found-error"

class DeleteGoalUseCase {
    constructor(private goalRepository: GoalRepositoryInterface) { }

    async execute({ goalId }: DeleteGoalRequestParamSchema) {

        // Validate if goal exists
        const goal = await this.goalRepository.getById(goalId)

        if (!goal) {
            throw new HttpResourceNotFoundError("Pergunta")
        }
        //

        const deletedGoal = await this.goalRepository.delete(goalId)

        const formatedResponse = {
            success: true,
            message: `Meta deletada com sucesso`,
            data: {
                ...deletedGoal
            },
            count: 1,
            type: "Goal"
        }

        return formatedResponse
    }
}

export { DeleteGoalUseCase }
