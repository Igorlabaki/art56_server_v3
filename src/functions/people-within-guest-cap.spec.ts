import { describe, expect, it } from "vitest";
import { peopleWithinGuestCap } from "./people-within-guest-cap";

const guest = { type: "GUEST" as const, name: "Ana" };
const worker = { type: "WORKER" as const, name: "Bruno" };

describe("peopleWithinGuestCap", () => {
    it("grava colaborador com a lista de convidados cheia", () => {
        expect(peopleWithinGuestCap({ people: [worker], savedGuestCount: 10, guestNumber: 10 })).toEqual([worker]);
    });

    it("grava colaborador quando a lista de convidados ja passou do numero", () => {
        expect(peopleWithinGuestCap({ people: [worker], savedGuestCount: 12, guestNumber: 10 })).toEqual([worker]);
    });

    it("recusa convidado com a lista cheia ou acima do numero", () => {
        expect(peopleWithinGuestCap({ people: [guest], savedGuestCount: 10, guestNumber: 10 })).toEqual([]);
        expect(peopleWithinGuestCap({ people: [guest], savedGuestCount: 12, guestNumber: 10 })).toEqual([]);
    });

    it("no lote misto, com a lista cheia, fica so o colaborador", () => {
        expect(peopleWithinGuestCap({
            people: [guest, worker, guest],
            savedGuestCount: 10,
            guestNumber: 10,
        })).toEqual([worker]);
    });

    it("com vaga, convidado e colaborador seguem juntos", () => {
        expect(peopleWithinGuestCap({
            people: [guest, worker],
            savedGuestCount: 9,
            guestNumber: 10,
        })).toEqual([guest, worker]);
    });

    it("colaborador ja salvo nao consome vaga de convidado", () => {
        expect(peopleWithinGuestCap({
            people: [guest],
            savedGuestCount: 1,
            guestNumber: 2,
        })).toEqual([guest]);
    });
});
