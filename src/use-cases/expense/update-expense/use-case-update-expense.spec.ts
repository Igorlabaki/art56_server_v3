import { describe, expect, it, vi } from "vitest";
import { Expense } from "@prisma/client";
import { ExpenseRepositoryInterface } from "../../../repositories/interface/expense-repository-interface";
import { UpdateExpenseRequestParams } from "../../../zod/expense/update-expense-params-schema";
import { UpdateExpenseUseCase } from "./use-case-update-expense";

function setup(stored: Partial<Expense>) {
  const expense = {
    id: "expense-1",
    name: "Campanha",
    amount: 300,
    type: "MONTHLY",
    category: "ADVERTISING",
    recurring: true,
    trafficSource: null,
    venueId: "venue-1",
    ...stored,
  } as Expense;
  const update = vi.fn(async (params: UpdateExpenseRequestParams) => ({ ...expense, ...params.data }));
  const repository = {
    getById: async () => expense,
    update,
  } as unknown as ExpenseRepositoryInterface;
  return { useCase: new UpdateExpenseUseCase(repository), update };
}

describe("editar despesa com canal", () => {
  it("Publicidade virando Imposto sem enviar canal grava null", async () => {
    const { useCase, update } = setup({ trafficSource: "INSTAGRAM" } as Partial<Expense>);

    await useCase.execute({ expenseId: "expense-1", data: { category: "TAX" } });

    expect(update.mock.calls[0][0].data.trafficSource).toBeNull();
  });

  it("editar so o valor preserva o canal gravado", async () => {
    const { useCase, update } = setup({ trafficSource: "TIKTOK" } as Partial<Expense>);

    await useCase.execute({ expenseId: "expense-1", data: { amount: 500 } });

    expect(update.mock.calls[0][0].data).toEqual({ amount: 500, trafficSource: "TIKTOK" });
  });

  it("Publicidade antiga sem canal nao pode ser editada sem escolher o canal", async () => {
    const { useCase, update } = setup({ trafficSource: null } as Partial<Expense>);

    await expect(
      useCase.execute({ expenseId: "expense-1", data: { amount: 500 } }),
    ).rejects.toMatchObject({ statusCode: 400, message: "Informe o canal da despesa de Publicidade." });
    expect(update).not.toHaveBeenCalled();
  });

  it("Publicidade antiga recebe o canal na edicao", async () => {
    const { useCase, update } = setup({ trafficSource: null } as Partial<Expense>);

    await useCase.execute({ expenseId: "expense-1", data: { trafficSource: "FACEBOOK" } });

    expect(update.mock.calls[0][0].data.trafficSource).toBe("FACEBOOK");
  });
});
