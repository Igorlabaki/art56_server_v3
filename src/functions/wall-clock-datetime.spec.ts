import { describe, expect, it } from "vitest";
import { transformDate } from "./transform-date";
import {
  formatWallClockDateBr,
  formatWallClockGoogleDateTime,
  formatWallClockTime,
  isWallClockDayInRange,
  parseDateOnlyWallClock,
  wallClockDateIsoFromDate,
  wallClockWeekdayEn,
} from "./wall-clock-datetime";

const ELEVEN = "2026-07-05T11:00:00.000Z";

describe("transformDate", () => {
  it("grava 11:00 e 11:00 no mesmo dia a partir de YYYY-MM-DD", () => {
    const { startDate, endDate } = transformDate({
      date: "2026-07-05",
      startHour: "11:00",
      endHour: "11:00",
    });

    expect(startDate.toISOString()).toBe(ELEVEN);
    expect(endDate.toISOString()).toBe(ELEVEN);
  });

  it("grava o mesmo ISO a partir de dd/MM/yyyy", () => {
    const { startDate, endDate } = transformDate({
      date: "05/07/2026",
      startHour: "11:00",
      endHour: "11:00",
      divisor: "/",
    });

    expect(startDate.toISOString()).toBe(ELEVEN);
    expect(endDate.toISOString()).toBe(ELEVEN);
  });

  it("joga o fim para o dia civil seguinte quando a hora fim e menor", () => {
    const { startDate, endDate } = transformDate({
      date: "05/07/2026",
      startHour: "22:00",
      endHour: "02:00",
    });

    expect(startDate.toISOString()).toBe("2026-07-05T22:00:00.000Z");
    expect(endDate.toISOString()).toBe("2026-07-06T02:00:00.000Z");
  });

  it("recusa formato fora de YYYY-MM-DD e dd/MM/yyyy", () => {
    expect(() =>
      transformDate({
        date: "5-7-2026",
        startHour: "11:00",
        endHour: "11:00",
      }),
    ).toThrow(/inválido/);
  });
});

describe("wall clock helpers", () => {
  const atEleven = new Date(ELEVEN);
  const atOneUtc = new Date("2026-07-05T01:00:00.000Z");

  it("le 11:00 dos componentes UTC", () => {
    expect(formatWallClockTime(atEleven)).toBe("11:00");
    expect(formatWallClockDateBr(atEleven)).toBe("05/07/2026");
  });

  it("monta o dia do cronograma sem cair no dia anterior", () => {
    const day = wallClockDateIsoFromDate(atOneUtc);
    const { startDate } = transformDate({
      date: day,
      startHour: "11:00",
      endHour: "11:00",
    });

    expect(day).toBe("2026-07-05");
    expect(startDate.toISOString()).toBe(ELEVEN);
  });

  it("usa domingo 5 de julho para a sazonalidade, nao sabado local", () => {
    expect(wallClockWeekdayEn(atOneUtc)).toBe("sunday");
    expect(wallClockDateIsoFromDate(atOneUtc)).toBe("2026-07-05");
    expect(isWallClockDayInRange(atOneUtc, "05/07", "05/07")).toBe(true);
  });

  it("envia ao Google os digitos sem Z", () => {
    expect(formatWallClockGoogleDateTime(atEleven)).toBe("2026-07-05T11:00:00");
    expect(formatWallClockGoogleDateTime(atEleven).endsWith("Z")).toBe(false);
  });

  it("grava dia de pagamento ao meio-dia UTC", () => {
    expect(parseDateOnlyWallClock("2026-07-05").toISOString()).toBe("2026-07-05T12:00:00.000Z");
    expect(parseDateOnlyWallClock("05/07/2026").toISOString()).toBe("2026-07-05T12:00:00.000Z");
    expect(() => parseDateOnlyWallClock("07-05-2026")).toThrow(/inválido/);
  });
});
