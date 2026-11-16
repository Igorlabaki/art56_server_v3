import { ExpenseCategory, ExpenseType, TrafficSource } from "@prisma/client";
import { HttpBadRequestError } from "../errors/errors-type/htttp-bad-request-error";

/** Canais aceitos na despesa de Publicidade e no relatorio de anuncios, na ordem de exibicao. */
export const ADS_CHANNELS = ["INSTAGRAM", "FACEBOOK", "TIKTOK", "GOOGLE", "OTHER"] as const;

export type AdsChannel = typeof ADS_CHANNELS[number];

/** Valor mensal e anual de uma despesa recorrente; `SPORADIC` nao recorre. */
export function recurringAmounts(type: ExpenseType, amount: number): { monthly: number; annual: number } {
  switch (type) {
    case "WEEKLY":
      return { monthly: (amount * 52) / 12, annual: amount * 52 };
    case "BIWEEKLY":
      return { monthly: amount * 2, annual: amount * 24 };
    case "MONTHLY":
      return { monthly: amount, annual: amount * 12 };
    case "ANNUAL":
      return { monthly: amount / 12, annual: amount };
    default:
      return { monthly: 0, annual: 0 };
  }
}

/** Canal gravado pela categoria final: obrigatorio em Publicidade e `null` nas demais. */
export function resolveExpenseTrafficSource<Channel extends TrafficSource>(
  category: ExpenseCategory,
  trafficSource: Channel | null | undefined,
): Channel | null {
  if (category !== "ADVERTISING") return null;
  if (!trafficSource) throw new HttpBadRequestError("Informe o canal da despesa de Publicidade.");
  return trafficSource;
}
