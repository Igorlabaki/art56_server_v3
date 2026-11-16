import { describe, expect, it } from "vitest";
import { Expense } from "@prisma/client";
import { ExpenseRepositoryInterface } from "../../../repositories/interface/expense-repository-interface";
import { AnalysisExpenseUseCase } from "./use-case-analysis-expense";

function expense(overrides: Partial<Expense>): Expense {
  return {
    id: overrides.name ?? "expense",
    name: "Despesa",
    description: null,
    amount: 0,
    paymentDate: null,
    type: "MONTHLY",
    category: "MAINTENANCE",
    recurring: true,
    createdAt: new Date("2026-01-01T12:00:00.000Z"),
    updatedAt: new Date("2026-01-01T12:00:00.000Z"),
    venueId: "venue-1",
    ...overrides,
  } as Expense;
}

function useCaseWith(expenses: Expense[]) {
  const repository = { analyze: async () => expenses } as unknown as ExpenseRepositoryInterface;
  return new AnalysisExpenseUseCase(repository);
}

describe("analise de despesas", () => {
  it("soma a recorrente semanal pelas 52 semanas do ano", async () => {
    const useCase = useCaseWith([
      expense({ name: "Limpeza", type: "WEEKLY", amount: 120 }),
      expense({ name: "Internet", type: "MONTHLY", amount: 100 }),
      expense({ name: "Reparo", type: "SPORADIC", recurring: false, amount: 300 }),
    ]);

    const { data } = await useCase.execute({ venueId: "venue-1", year: "2026" });

    expect(data.total.monthly).toBe(620);
    expect(data.total.annual).toBe(7440);
    expect(data.total.esporadic).toBe(300);
    expect(data.recurring).toEqual([
      { name: "Limpeza", monthly: 520, annual: 6240 },
      { name: "Internet", monthly: 100, annual: 1200 },
    ]);
    expect(data.esporadic).toEqual([{ name: "Reparo", total: 300 }]);
  });
});
