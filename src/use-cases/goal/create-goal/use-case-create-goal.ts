import { months } from "moment";
import { HttpConflictError } from "../../../errors/errors-type/htttp-conflict-error";
import { GoalRepositoryInterface } from "../../../repositories/interface/goal-repository-interface";
import { CreateGoalRequestParams } from "../../../zod/goal/create-goal-params-schema";

class CreateGoalUseCase {
  constructor(private goalRepository: GoalRepositoryInterface) {}

  async execute(params: CreateGoalRequestParams) {
    const goalnAlreadyExists = await this.goalRepository.verifyIfGoalAlreadyExists({
      venueId: params.venueId,
      minValue: Number(params.minValue)
    });

    if(goalnAlreadyExists){
      throw new HttpConflictError("Essa meta ja esta cadastrada.")
    }

    const newGoal = await this.goalRepository.create({
      venueId: params.venueId,
      months: params.months.join(""),
      maxValue: Number(params.maxValue),
      minValue: Number(params.minValue),
      increasePercent: Number(params.increasePercent),
    });

    const formatedResponse = {
      success: true,
      message: "Meta foi criada com sucesso",
      data: {
         ...newGoal
      },
      count: 1,
      type: "Goal"
  } 

  return formatedResponse
  }
}

export { CreateGoalUseCase };
