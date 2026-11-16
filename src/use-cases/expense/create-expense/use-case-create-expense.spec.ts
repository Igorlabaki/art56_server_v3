import { describe, expect, it, vi } from "vitest";
import { Request, Response } from "express";
import { ExpenseRepositoryInterface } from "../../../repositories/interface/expense-repository-interface";
import { CreateExpenseRequestParams } from "../../../zod/expense/create-expense-params-schema";
import { CreateExpenseUseCase } from "./use-case-create-expense";
import { CreateExpenseController } from "./controller-create-expense";

function setup() {
  const create = vi.fn(async (params: CreateExpenseRequestParams) => ({ id: "expense-1", ...params }));
  const repository = {
    getByName: async () => null,
    create,
  } as unknown as ExpenseRepositoryInterface;
  return { useCase: new CreateExpenseUseCase(repository), create };
}

const base: CreateExpenseRequestParams = {
  venueId: "venue-1",
  name: "Campanha",
  amount: 300,
  type: "MONTHLY",
  category: "ADVERTISING",
  recurring: true,
};

describe("criar despesa com canal", () => {
  it("Publicidade com Instagram grava o canal", async () => {
    const { useCase, create } = setup();

    await useCase.execute({ ...base, trafficSource: "INSTAGRAM" });

    expect(create.mock.calls[0][0].trafficSource).toBe("INSTAGRAM");
  });

  it("Publicidade sem canal e recusada com 400", async () => {
    const { useCase, create } = setup();

    await expect(useCase.execute(base)).rejects.toMatchObject({
      statusCode: 400,
      message: "Informe o canal da despesa de Publicidade.",
    });
    expect(create).not.toHaveBeenCalled();
  });

  it("Manutencao descarta o canal enviado", async () => {
    const { useCase, create } = setup();

    await useCase.execute({ ...base, category: "MAINTENANCE", trafficSource: "GOOGLE" });

    expect(create.mock.calls[0][0].trafficSource).toBeNull();
  });
});

describe("controller de criar despesa", () => {
  it("passa ao use case so os campos validados", async () => {
    const execute = vi.fn().mockResolvedValue({ success: true });
    const controller = new CreateExpenseController({ execute } as unknown as CreateExpenseUseCase);
    const json = vi.fn();
    const resp = { status: vi.fn(() => ({ json })) } as unknown as Response;
    const req = { body: { ...base, trafficSource: "TIKTOK", foo: "bar" } } as unknown as Request;

    await controller.handle(req, resp);

    expect(execute).toHaveBeenCalledWith({ ...base, trafficSource: "TIKTOK" });
  });
});
