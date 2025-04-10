import { UpdateGoalRequestParams } from "../../../zod/goal/update-goal-params-schema"
import { HttpConflictError } from "../../../errors/errors-type/htttp-conflict-error"
import { GoalRepositoryInterface } from "../../../repositories/interface/goal-repository-interface"
import { HttpResourceNotFoundError } from "../../../errors/errors-type/http-resource-not-found-error"

class UpdateGoalUseCase {
    constructor(private goalRepository: GoalRepositoryInterface) { }

    async execute(param: UpdateGoalRequestParams) {

        // Validate if goal exists
        const goal = await this.goalRepository.getById(param.goalId)

        if (!goal) {
            throw new HttpResourceNotFoundError("Meta")
        }
        //

        const goalAlreadyExists = await this.goalRepository.verifyIfGoalAlreadyExists({
            venueId: param.venueId,
            minValue: param.data.minValue
        });

        if (goalAlreadyExists) {
            throw new HttpConflictError("Essa meta ja esta cadastrada.")
        }

        const updatedGoal = await this.goalRepository.update(param)

        if (!updatedGoal) {
            throw new HttpConflictError("Meta")
        }

        const formatedResponse = {
            success: true,
            message: `Meta atualizado(a) com sucesso`,
            data: {
                ...updatedGoal
            },
            count: 1,
            type: "Goal"
        }

        return formatedResponse
    }
}

export { UpdateGoalUseCase }
