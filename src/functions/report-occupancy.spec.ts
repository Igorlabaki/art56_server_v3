import { describe, expect, it } from "vitest";
import { BAND_HOURS, OCCUPANCY_GROUPS, buildOccupancy, occupancyPeriod } from "./report-occupancy";

const at = (iso: string) => new Date(`${iso}Z`);
const row = (type: string, start: string, end: string) => ({ type, startDate: at(start), endDate: at(end) });
const year2026 = occupancyPeriod(2026);

function cell(data: ReturnType<typeof buildOccupancy>, weekday: number, band: number) {
  return data.cells.find((item) => item.weekday === weekday && item.band === band)!;
}

describe("buildOccupancy", () => {
  it("funde eventos sobrepostos do mesmo grupo", () => {
    const data = buildOccupancy([
      row("EVENT", "2026-11-10T10:00:00", "2026-11-10T14:00:00"),
      row("EVENT", "2026-11-10T12:00:00", "2026-11-10T16:00:00"),
    ], year2026);
    expect(data.totals.events).toBe(360);
    expect(data.totals.total).toBe(360);
    expect(data.daysWithRecords.events).toBe(1);
    expect(cell(data, 2, 6).events).toBe(120);
  });

  it("total e a uniao dos grupos", () => {
    const data = buildOccupancy([
      row("EVENT", "2026-11-10T10:00:00", "2026-11-10T12:00:00"),
      row("VISIT", "2026-11-10T11:00:00", "2026-11-10T13:00:00"),
    ], year2026);
    expect(data.totals).toEqual({ events: 120, visits: 120, blocks: 0, total: 180 });
  });

  it("quebra na meia-noite em componentes UTC", () => {
    const data = buildOccupancy([row("EVENT", "2026-11-07T22:00:00", "2026-11-08T02:00:00")], year2026);
    expect(cell(data, 6, 11).events).toBe(120);
    expect(cell(data, 0, 0).events).toBe(120);
    expect(data.daysWithRecords.events).toBe(2);
    expect(data.daysWithRecords.total).toBe(2);
  });

  it("fim exatamente a meia-noite nao marca o dia seguinte", () => {
    const data = buildOccupancy([row("EVENT", "2026-11-07T20:00:00", "2026-11-08T00:00:00")], year2026);
    expect(data.totals.events).toBe(240);
    expect(data.daysWithRecords.events).toBe(1);
    expect(data.cells.filter((item) => item.weekday === 0).every((item) => item.total === 0)).toBe(true);
  });

  it("descarta fim antes ou igual ao inicio", () => {
    const data = buildOccupancy([
      row("EVENT", "2026-11-10T10:00:00", "2026-11-10T10:00:00"),
      row("VISIT", "2026-11-10T10:00:00", "2026-11-10T09:00:00"),
      row("EVENT", "2026-11-10T10:00:00", "2026-11-10T11:00:00"),
    ], year2026);
    expect(data.discarded).toBe(2);
    expect(data.totals.total).toBe(60);
  });

  it("corta na borda do ano e do mes", () => {
    const crossing = [row("EVENT", "2025-12-31T22:00:00", "2026-01-01T02:00:00")];
    expect(buildOccupancy(crossing, year2026).totals.events).toBe(120);
    expect(buildOccupancy(crossing, occupancyPeriod(2025)).totals.events).toBe(120);

    const monthCrossing = [row("EVENT", "2026-03-31T23:00:00", "2026-04-01T01:00:00")];
    expect(buildOccupancy(monthCrossing, occupancyPeriod(2026, 3)).totals.events).toBe(60);
    expect(buildOccupancy(monthCrossing, occupancyPeriod(2026, 4)).totals.events).toBe(60);
    expect(buildOccupancy(monthCrossing, occupancyPeriod(2026, 5)).totals.events).toBe(0);
  });

  it("ignora PROPOSAL e manda OTHER para bloqueios", () => {
    const data = buildOccupancy([
      row("PROPOSAL", "2026-11-10T10:00:00", "2026-11-10T12:00:00"),
      row("OTHER", "2026-11-10T14:00:00", "2026-11-10T15:00:00"),
      row("OVERNIGHT", "2026-11-10T16:00:00", "2026-11-10T17:00:00"),
    ], year2026);
    expect(data.totals).toEqual({ events: 60, visits: 0, blocks: 60, total: 120 });
    expect(OCCUPANCY_GROUPS.blocks).toEqual(["OTHER"]);
    expect(Object.values(OCCUPANCY_GROUPS).flat()).not.toContain("PROPOSAL");
  });

  it("sempre devolve 84 celulas, taxa nula e horario do espaco sem disponibilidade definida", () => {
    const data = buildOccupancy([], occupancyPeriod(2026, 2), { openingHour: "08:00", closingHour: "22:00" });
    expect(data.cells).toHaveLength(84);
    expect(data.bandHours).toBe(BAND_HOURS);
    expect(data.occupancyRate).toBeNull();
    expect(data.period).toEqual({ kind: "month", year: 2026, month: 2 });
    expect(data.availability).toEqual({ defined: false, openingHour: "08:00", closingHour: "22:00" });
    expect(data.totals.total).toBe(0);
  });

  it("evento longo respeita o teto de 120 minutos por celula e por dia", () => {
    const data = buildOccupancy([row("BARTER", "2026-11-02T00:00:00", "2026-11-09T00:00:00")], year2026);
    expect(data.totals.events).toBe(7 * 24 * 60);
    expect(data.cells.every((item) => item.events === 120)).toBe(true);
    expect(data.daysWithRecords.events).toBe(7);
  });
});
