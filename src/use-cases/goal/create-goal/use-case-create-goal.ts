import { HttpConflictError } from "../../../errors/errors-type/htttp-conflict-error";
import { GoalRepositoryInterface } from "../../../repositories/interface/goal-repository-interface";
import { CreateGoalRequestParams } from "../../../zod/goal/create-goal-params-schema";

class CreateGoalUseCase {
  constructor(private goalRepository: GoalRepositoryInterface) {}

  async execute(params: CreateGoalRequestParams) {
    const goalList = await this.goalRepository.list({
      venueId: params.venueId,
    }) || [];

    const normalizedGoals = goalList.map(goal => ({
      ...goal,
      monthsArray: goal.months.split(","),
    }));

    const incomingMonths = new Set(params.months);
    const incomingMinValue = Number(params.minValue);
  
    const goalAlreadyExists = normalizedGoals.some(goal => {
      const goalMinValue = goal.minValue;
      const goalMaxValue = goal.maxValue ?? Infinity; // Se maxValue for null, considera-se infinito
  
      const isMinValueInRange = incomingMinValue >= goalMinValue && incomingMinValue <= goalMaxValue;
  
      const hasOverlappingMonths = goal.monthsArray.some(month => incomingMonths.has(month));
  
      return isMinValueInRange && hasOverlappingMonths;
    });
    
    if (goalAlreadyExists) {
      throw new HttpConflictError("Já existe uma meta para esses meses e esse  valor.");
    }

    const newGoal = await this.goalRepository.create({
      venueId: params.venueId,
      months: params.months.join(","), 
      maxValue: Number(params.maxValue),
      minValue: Number(params.minValue),
      increasePercent: Number(params.increasePercent),
    });

    return {
      success: true,
      message: "Meta foi criada com sucesso",
      data: { ...newGoal },
      count: 1,
      type: "Goal",
    };
  }
}

export { CreateGoalUseCase };