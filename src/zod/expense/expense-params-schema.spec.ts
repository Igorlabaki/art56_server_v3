import { describe, expect, it } from "vitest";
import { ZodError } from "zod";
import { handleErrors } from "../../errors/error-handler";
import { createExpenseRequestParams } from "./create-expense-params-schema";
import { updateExpenseSchema } from "./update-expense-params-schema";

const base = {
  venueId: "venue-1",
  name: "Campanha",
  amount: 300,
  type: "MONTHLY",
  category: "ADVERTISING",
  recurring: true,
};

describe("canal no schema da despesa", () => {
  it("aceita os cinco canais e null", () => {
    for (const trafficSource of ["INSTAGRAM", "FACEBOOK", "TIKTOK", "GOOGLE", "OTHER", null]) {
      expect(createExpenseRequestParams.parse({ ...base, trafficSource }).trafficSource).toBe(trafficSource);
    }
  });

  it("recusa canal fora dos cinco com 400", () => {
    let error: unknown;
    try {
      createExpenseRequestParams.parse({ ...base, trafficSource: "FRIEND" });
    } catch (caught) {
      error = caught;
    }
    expect(error).toBeInstanceOf(ZodError);
    expect(handleErrors(error).statusCode).toBe(400);
  });

  it("descarta campos fora do schema", () => {
    expect(createExpenseRequestParams.parse({ ...base, foo: "bar" })).not.toHaveProperty("foo");
  });

  it("edicao aceita canal opcional", () => {
    const parsed = updateExpenseSchema.parse({ expenseId: "expense-1", data: { trafficSource: "GOOGLE" } });
    expect(parsed.data.trafficSource).toBe("GOOGLE");
    expect(() =>
      updateExpenseSchema.parse({ expenseId: "expense-1", data: { trafficSource: "AIRBNB" } }),
    ).toThrow(ZodError);
  });
});
