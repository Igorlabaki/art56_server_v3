import { describe, expect, it } from "vitest";
import { HttpForbiddenError } from "../../../errors/errors-type/http-forbidden-error";
import { reportYearRange } from "../../../functions/report-year-range";
import { ReportProposalWhere } from "../../../repositories/interface/proposal-repository-interface";
import { OccupancyRowsQuery } from "../../../repositories/interface/data-event-repository-interface";
import { venueRoutes } from "../../../router/venue";
import { GetEventProfileReportUseCase } from "./event-profile/use-case-get-event-profile-report";
import { GetLeadTimeReportUseCase } from "./lead-time/use-case-get-lead-time-report";
import { GetOccupancyReportUseCase } from "./occupancy/use-case-get-occupancy-report";
import { ReportAuthorizer } from "./report-authorizer";
import { GetServiceAdherenceReportUseCase } from "./service-adherence/use-case-get-service-adherence-report";

const venue = { id: "venue-a", organizationId: "org-1", maxGuest: 100, openingHour: "08:00", closingHour: "22:00" };

function authorizer(granted: boolean) {
    return new ReportAuthorizer(
        { getById: async () => venue as never },
        { getUserVenuePermission: async () => ({ permissions: granted ? "VIEW_VENUE_ANALYSIS" : "VIEW_VENUE_INFO" }) as never },
    );
}

function fakeProposals() {
    const calls: { method: string; where: ReportProposalWhere }[] = [];
    return {
        calls,
        leadTimeRows: async (where: ReportProposalWhere) => {
            calls.push({ method: "leadTimeRows", where });
            return [
                { createdAt: new Date("2025-12-31T23:30:00-03:00"), startDate: new Date("2026-01-20T10:00:00Z"), approved: true },
                { createdAt: new Date("2026-01-01T02:30:00Z"), startDate: new Date("2026-01-03T10:00:00Z"), approved: false },
                { createdAt: new Date("2026-03-01T12:00:00-03:00"), startDate: new Date("2026-03-11T10:00:00Z"), approved: true },
            ];
        },
        serviceAdherenceRows: async (where: ReportProposalWhere) => {
            calls.push({ method: "serviceAdherenceRows", where });
            return [
                { id: "prop-secret-1", proposalServices: [{ serviceId: "svc-1", amount: 300, service: { name: "Buffet" } }] },
                { id: "prop-secret-2", proposalServices: [] },
            ];
        },
        eventProfileRows: async (where: ReportProposalWhere) => {
            calls.push({ method: "eventProfileRows", where });
            return [
                { guestNumber: 90, eventCategory: "WEDDING" as const },
                { guestNumber: 120, eventCategory: null },
            ];
        },
    };
}

function fakeDateEvents() {
    const calls: OccupancyRowsQuery[] = [];
    return {
        calls,
        occupancyRows: async (query: OccupancyRowsQuery) => {
            calls.push(query);
            return [{ type: "EVENT" as const, startDate: new Date("2026-03-31T23:00:00Z"), endDate: new Date("2026-04-01T01:00:00Z") }];
        },
    };
}

describe("relatorios agregados do espaco", () => {
    it("403 nao chama nenhum repositorio de dados", async () => {
        const proposals = fakeProposals();
        const dateEvents = fakeDateEvents();
        const denied = authorizer(false);
        const params = { venueId: "venue-a", year: 2026 };

        await expect(new GetOccupancyReportUseCase(dateEvents, denied).execute("user-1", params)).rejects.toBeInstanceOf(HttpForbiddenError);
        await expect(new GetLeadTimeReportUseCase(proposals, denied).execute("user-1", params)).rejects.toBeInstanceOf(HttpForbiddenError);
        await expect(new GetServiceAdherenceReportUseCase(proposals, denied).execute("user-1", params)).rejects.toBeInstanceOf(HttpForbiddenError);
        await expect(new GetEventProfileReportUseCase(proposals, denied).execute("user-1", params)).rejects.toBeInstanceOf(HttpForbiddenError);
        expect(proposals.calls).toEqual([]);
        expect(dateEvents.calls).toEqual([]);
    });

    it("ocupacao usa o mes do ano ativo ou o ano inteiro e devolve o horario do espaco", async () => {
        const dateEvents = fakeDateEvents();
        const useCase = new GetOccupancyReportUseCase(dateEvents, authorizer(true));

        const month = await useCase.execute("user-1", { venueId: "venue-a", year: 2026, month: 3 });
        expect(dateEvents.calls[0].range).toEqual({ gte: new Date("2026-03-01T00:00:00Z"), lt: new Date("2026-04-01T00:00:00Z") });
        expect(dateEvents.calls[0].types).not.toContain("PROPOSAL");
        expect(month.data.period).toEqual({ kind: "month", year: 2026, month: 3 });
        expect(month.data.totals.events).toBe(60);
        expect(month.data.availability).toEqual({ defined: false, openingHour: "08:00", closingHour: "22:00" });
        expect(month).toMatchObject({ success: true, message: "Sucesso", count: 1, type: "OccupancyReport" });

        const year = await useCase.execute("user-1", { venueId: "venue-a", year: 2026 });
        expect(dateEvents.calls[1].range).toEqual(reportYearRange(2026));
        expect(year.data.period).toEqual({ kind: "year", year: 2026, month: null });
        expect(year.data.totals.events).toBe(120);
    });

    it("antecedencia busca createdAt com folga de um dia e filtra pelo ano local", async () => {
        const proposals = fakeProposals();
        const response = await new GetLeadTimeReportUseCase(proposals, authorizer(true)).execute("user-1", { venueId: "venue-a", year: 2026 });

        expect(proposals.calls[0].where).toEqual({
            venueId: "venue-a",
            createdAt: { gte: new Date("2025-12-31T00:00:00Z"), lt: new Date("2027-01-02T00:00:00Z") },
        });
        expect(response.data).toMatchObject({ year: 2026, eventCategory: null, created: 1, considered: 1, medianDays: 10 });
    });

    it("eventCategory NONE vira null no where e ausente nao filtra", async () => {
        const proposals = fakeProposals();
        const granted = authorizer(true);
        await new GetLeadTimeReportUseCase(proposals, granted).execute("user-1", { venueId: "venue-a", year: 2026, eventCategory: "NONE" });
        await new GetServiceAdherenceReportUseCase(proposals, granted).execute("user-1", { venueId: "venue-a", year: 2026, eventCategory: "WEDDING" });
        await new GetServiceAdherenceReportUseCase(proposals, granted).execute("user-1", { venueId: "venue-a", year: 2026 });

        expect(proposals.calls[0].where.eventCategory).toBeNull();
        expect(proposals.calls[1].where.eventCategory).toBe("WEDDING");
        expect("eventCategory" in proposals.calls[2].where).toBe(false);
    });

    it("servicos e porte usam aprovadas com startDate no ano", async () => {
        const proposals = fakeProposals();
        const granted = authorizer(true);
        const services = await new GetServiceAdherenceReportUseCase(proposals, granted).execute("user-1", { venueId: "venue-a", year: 2026 });
        const profile = await new GetEventProfileReportUseCase(proposals, granted)
            .execute("user-1", { venueId: "venue-a", year: 2026, eventCategory: "WEDDING" });

        const expected = { venueId: "venue-a", approved: true, startDate: reportYearRange(2026) };
        expect(proposals.calls[0].where).toEqual(expected);
        expect(proposals.calls[1].where).toEqual(expected);
        expect(services.data).toMatchObject({ approvedProposals: 2, services: [{ serviceId: "svc-1", adherence: 0.5, amountSum: 300 }] });
        expect(profile.data).toMatchObject({ events: 2, capacity: { maxGuest: 100, atLeast80: 2, above100: 1 } });
    });

    it("nenhuma resposta expoe id de proposta, nome ou contato", async () => {
        const proposals = fakeProposals();
        const granted = authorizer(true);
        const params = { venueId: "venue-a", year: 2026 };
        const responses = await Promise.all([
            new GetLeadTimeReportUseCase(proposals, granted).execute("user-1", params),
            new GetServiceAdherenceReportUseCase(proposals, granted).execute("user-1", params),
            new GetEventProfileReportUseCase(proposals, granted).execute("user-1", params),
            new GetOccupancyReportUseCase(fakeDateEvents(), granted).execute("user-1", params),
        ]);
        const body = JSON.stringify(responses);
        expect(body).not.toContain("prop-secret");
        expect(body).not.toMatch(/completeClientName|email|whatsapp|organizationId|"id"/);
    });

    it("rotas literais de /reports sao as primeiras a casar e exigem autenticacao", () => {
        const stack = (venueRoutes as unknown as {
            stack: { match: (path: string) => boolean; route?: { path: string; methods: Record<string, boolean>; stack: { name: string }[] } }[];
        }).stack;
        for (const name of ["occupancy", "lead-time", "service-adherence", "event-profile"]) {
            const path = `/reports/${name}`;
            const first = stack.find((layer) => layer.route?.methods.get && layer.match(path));
            expect(first?.route?.path).toBe(path);
            expect(first?.route?.stack.map((layer) => layer.name)).toContain("ensureAuthenticate");
        }
    });
});
