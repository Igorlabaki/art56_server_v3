export interface YearlyChange {
  events: number | null;
  proposals: number | null;
  visits: number | null;
  revenue: number | null;
}

/** Percentual inteiro contra o ano anterior; `null` quando o ano anterior e 0 e nao ha base. */
export function yearlyChange(current: number, previous: number): number | null {
  if (previous === 0) return null;
  return Math.round(((current - previous) / previous) * 100);
}

/**
 * Mesma janela do card da visao geral, um ano antes. Repete a construcao local de
 * `getVenueAnalytics` para os dois lados da comparacao cobrirem o mesmo trecho do mes.
 * `monthIndex` null e o ano inteiro (`month=all`).
 */
export function previousYearWindow(year: number, monthIndex: number | null): { start: Date; end: Date } {
  if (monthIndex === null) {
    return { start: new Date(year - 1, 0, 1), end: new Date(year - 1, 11, 31) };
  }
  return { start: new Date(year - 1, monthIndex, 1), end: new Date(year - 1, monthIndex + 1, 0) };
}
