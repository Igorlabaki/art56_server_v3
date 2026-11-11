import { describe, expect, it } from "vitest";
import { buildEventProfile } from "./report-event-profile";

const rows = (guests: number[], eventCategory: string | null = null) =>
  guests.map((guestNumber) => ({ guestNumber, eventCategory }));

describe("buildEventProfile", () => {
  it("coloca os limites de convidados nas faixas certas", () => {
    const data = buildEventProfile(rows([0, 50, 51, 100, 101, 150, 151, -5]), 2026, 200);
    expect(data.guestBuckets.map((bucket) => bucket.count)).toEqual([3, 2, 2, 1]);
    expect(data.guestBuckets.reduce((sum, bucket) => sum + bucket.count, 0)).toBe(data.events);
    expect(data.guestBuckets[3]).toEqual({ key: "151+", min: 151, max: null, count: 1 });
  });

  it("mede o uso da capacidade sem ponto flutuante", () => {
    const data = buildEventProfile(rows([79, 80, 100, 101]), 2026, 100);
    expect(data.capacity).toEqual({ maxGuest: 100, atLeast80: 3, above100: 1, atLeast80Rate: 0.75, above100Rate: 0.25 });

    const odd = buildEventProfile(rows([5, 6]), 2026, 7);
    expect(odd.capacity?.atLeast80).toBe(1);
  });

  it("capacidade invalida vira null e mantem as faixas", () => {
    for (const maxGuest of [0, -1, 10.5, null]) {
      const data = buildEventProfile(rows([10, 60]), 2026, maxGuest);
      expect(data.capacity).toBeNull();
      expect(data.guestBuckets.map((bucket) => bucket.count)).toEqual([1, 1, 0, 0]);
    }
  });

  it("sem eventos: taxas nulas e categorias vazias", () => {
    const data = buildEventProfile([], 2026, 100);
    expect(data.events).toBe(0);
    expect(data.categories).toEqual([]);
    expect(data.capacity).toMatchObject({ atLeast80Rate: null, above100Rate: null });
  });

  it("lista so categorias com evento, da maior para a menor, com null para sem categoria", () => {
    const data = buildEventProfile([...rows([10, 20], "WEDDING"), ...rows([30]), ...rows([40, 50, 60], "CORPORATE")], 2026, 100);
    expect(data.categories).toEqual([
      { eventCategory: "CORPORATE", count: 3 },
      { eventCategory: "WEDDING", count: 2 },
      { eventCategory: null, count: 1 },
    ]);
  });
});
