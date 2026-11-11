import { HttpBadRequestError } from "../errors/errors-type/htttp-bad-request-error";

export const DISCOUNT_MESSAGE = "Informe um desconto de 0 a 100%, com até duas casas decimais.";

export const NO_DISCOUNT = { discountPercent: 0, discountAmount: 0 } as const;

export interface ProposalDiscount {
    discountPercent: number;
    discountAmount: number;
    totalAmount: number;
}

function round2(value: number): number {
    return Math.round(value * 100) / 100;
}

function hasAtMostTwoDecimals(value: number): boolean {
    const cents = value * 100;
    return Math.abs(Math.round(cents) - cents) < 1e-9;
}

export function discountPercentValue(raw: unknown): number {
    if (raw === undefined || raw === null) return 0;
    if (typeof raw !== "number" || !Number.isFinite(raw) || raw < 0 || raw > 100 || !hasAtMostTwoDecimals(raw)) {
        throw new HttpBadRequestError(DISCOUNT_MESSAGE);
    }
    return round2(raw);
}

export function discountRemovedSuffix(percent: number | null | undefined): string {
    if (!percent) return "";
    return ` (desconto de ${String(percent).replace(".", ",")}% removido)`;
}

/** `subtotal` e o total do pipeline; o total gravado e o liquido. */
export function applyProposalDiscount(subtotal: number, percent: number): ProposalDiscount {
    if (!percent) return { ...NO_DISCOUNT, totalAmount: subtotal };
    const discountAmount = round2((subtotal * percent) / 100);
    return { discountPercent: percent, discountAmount, totalAmount: round2(subtotal - discountAmount) };
}
