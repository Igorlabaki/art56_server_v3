import { UpdateGoalRequestParams } from "../../../zod/goal/update-goal-params-schema"
import { HttpConflictError } from "../../../errors/errors-type/htttp-conflict-error"
import { GoalRepositoryInterface } from "../../../repositories/interface/goal-repository-interface"
import { HttpResourceNotFoundError } from "../../../errors/errors-type/http-resource-not-found-error"

class UpdateGoalUseCase {
    constructor(private goalRepository: GoalRepositoryInterface) { }

    async execute(param: UpdateGoalRequestParams) {

        // Valida se a meta existe
        const goal = await this.goalRepository.getById(param.goalId)

        if (!goal) {
            throw new HttpResourceNotFoundError("Meta")
        }

        // Verifica se a meta com o mesmo valor já está cadastrada, mas excluindo a meta atual
        const goalList = await this.goalRepository.list({
            venueId: param.venueId,
        }) || [];

        const normalizedGoals = goalList.map(goal => ({
            ...goal,
            monthsArray: goal.months.split(","),
        }));

        const incomingMonths = new Set(param.data.months);

        const goalAlreadyExists = normalizedGoals.some(existingGoal => {
            // Verifica se a meta já existe, excluindo a meta atual (goal.id)
            if (existingGoal.id === param.goalId) return false;
            if (existingGoal.minValue !== Number(param.data.minValue)) return false;
            return existingGoal.monthsArray.some(month => incomingMonths.has(month));
        });

        if (goalAlreadyExists) {
            throw new HttpConflictError("Já existe uma meta para esses meses e esse valor.");
        }

        // Realiza a atualização da meta
        const updatedGoal = await this.goalRepository.update(param)

        if (!updatedGoal) {
            throw new HttpConflictError("Erro ao atualizar a meta.")
        }

        // Formata a resposta de sucesso
        const formatedResponse = {
            success: true,
            message: `Meta atualizada com sucesso`,
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
