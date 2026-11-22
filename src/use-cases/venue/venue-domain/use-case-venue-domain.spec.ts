import { randomUUID } from "crypto";
import { describe, expect, it } from "vitest";
import { HttpBadRequestError } from "../../../errors/errors-type/htttp-bad-request-error";
import { HttpConflictError } from "../../../errors/errors-type/htttp-conflict-error";
import { HttpForbiddenError } from "../../../errors/errors-type/http-forbidden-error";
import { HttpResourceNotFoundError } from "../../../errors/errors-type/http-resource-not-found-error";
import { normalizeVenueHostname } from "../../../functions/venue-domain-hostname";
import { VenueInfoEditPermission } from "../../../repositories/interface/venue-link-repository-interface";
import {
    VenueDomainReadPermission,
    VenueDomainRecord,
    VenueDomainRepository,
    VenueDomainStatus,
    VenueDomainVenue,
} from "../../../repositories/interface/venue-domain-repository-interface";
import { venueRoutes } from "../../../router/venue";
import { VenueDomainChallenge, VenueDomainRegistrar } from "./venue-domain-registrar";
import { DeleteVenueDomainUseCase, GetVenueDomainUseCase, ResolveVenueDomainUseCase, SaveVenueDomainUseCase, VerifyVenueDomainUseCase } from "./use-case-venue-domain";

const allow: VenueInfoEditPermission = { canEditVenueInfo: async () => true };
const deny: VenueInfoEditPermission = { canEditVenueInfo: async () => false };
const allowRead: VenueDomainReadPermission = { canReadVenueDomain: async () => true };
const denyRead: VenueDomainReadPermission = { canReadVenueDomain: async () => false };

function registrar(): VenueDomainRegistrar & { calls: string[] } {
    return {
        calls: [],
        async add(hostname: string): Promise<VenueDomainChallenge> {
            this.calls.push(`add:${hostname}`);
            return { type: "TXT", name: `_vercel.${hostname}`, value: "challenge-token" };
        },
        async verify(hostname: string) {
            this.calls.push(`verify:${hostname}`);
            return false;
        },
        async remove(hostname: string) {
            this.calls.push(`remove:${hostname}`);
        },
    };
}

function memory(venues: VenueDomainVenue[], seed: VenueDomainRecord[] = []) {
    const rows = seed.map((row) => ({ ...row }));
    const domains: VenueDomainRepository = {
        async findVenue(key) {
            return venues.find((venue) => venue.id === key || venue.name === key) ?? null;
        },
        async listByVenue(venueId) {
            return rows.filter((row) => row.venueId === venueId).map((row) => ({ ...row }));
        },
        async findByHostname(hostname) {
            const row = rows.find((item) => item.hostname === hostname);
            return row ? { ...row } : null;
        },
        async findActiveByHostname(hostname) {
            const row = rows.find((item) => item.hostname === hostname && item.status === "ACTIVE");
            if (!row) return null;
            const venue = venues.find((item) => item.id === row.venueId);
            return venue ? { venueId: venue.id, name: venue.name } : null;
        },
        async savePending(venueId, hostname, challenge) {
            const pending = rows.find((row) => row.venueId === venueId && row.status === "PENDING");
            const next: VenueDomainRecord = {
                id: pending?.id ?? randomUUID(),
                venueId,
                hostname,
                status: "PENDING",
                verificationType: challenge?.type ?? null,
                verificationName: challenge?.name ?? null,
                verificationValue: challenge?.value ?? null,
            };
            if (pending) Object.assign(pending, next);
            else rows.push(next);
            return { ...next };
        },
        async markActive(id) {
            const row = rows.find((item) => item.id === id);
            if (!row) throw new Error("missing domain");
            row.status = "ACTIVE";
            return { ...row };
        },
        async markRemoved(id) {
            const row = rows.find((item) => item.id === id);
            if (!row) return;
            row.status = "REMOVED";
            row.hostname = `revoked:${id}`;
            row.verificationType = null;
            row.verificationName = null;
            row.verificationValue = null;
        },
    };
    return { domains, rows };
}

function row(venueId: string, hostname: string, status: VenueDomainStatus): VenueDomainRecord {
    return {
        id: randomUUID(),
        venueId,
        hostname,
        status,
        verificationType: null,
        verificationName: null,
        verificationValue: null,
    };
}

describe("normalizar hostname", () => {
    it("tira esquema e barra e deixa o host limpo", () => {
        expect(normalizeVenueHostname("https://WWW.Casa.com/").hostname).toBe("www.casa.com");
        expect(normalizeVenueHostname("HTTP://www.casa.com.").hostname).toBe("www.casa.com");
    });

    it("recusa localhost, vercel.app, IP, caminho e porta", () => {
        expect(normalizeVenueHostname("localhost").ok).toBe(false);
        expect(normalizeVenueHostname("https://foo.vercel.app/").ok).toBe(false);
        expect(normalizeVenueHostname("127.0.0.1").ok).toBe(false);
        expect(normalizeVenueHostname("https://www.casa.com/links").ok).toBe(false);
        expect(normalizeVenueHostname("www.casa.com:443").ok).toBe(false);
        expect(normalizeVenueHostname("  ").ok).toBe(false);
    });
});

describe("gravar dominio", () => {
    const venues = [
        { id: "venue-a", name: "Casa A" },
        { id: "venue-b", name: "Casa B" },
    ];

    it("grava o host limpo como pendente e chama o registrar uma vez", async () => {
        const { domains, rows } = memory(venues);
        const fake = registrar();
        const saved = await new SaveVenueDomainUseCase(domains, allow, fake).execute("user-1", "Casa A", "https://WWW.Casa.com/");
        expect(saved.data).toMatchObject({
            hostname: "www.casa.com",
            status: "PENDING",
            verification: { type: "TXT", name: "_vercel.www.casa.com", value: "challenge-token" },
        });
        expect(fake.calls).toEqual(["add:www.casa.com"]);
        expect(rows).toHaveLength(1);
        expect(rows[0]?.status).toBe("PENDING");
    });

    it("localhost e vercel.app respondem 400 e nao chamam o registrar", async () => {
        const { domains, rows } = memory(venues);
        const fake = registrar();
        const save = new SaveVenueDomainUseCase(domains, allow, fake);
        await expect(save.execute("user-1", "Casa A", "localhost")).rejects.toBeInstanceOf(HttpBadRequestError);
        await expect(save.execute("user-1", "Casa A", "https://casa.vercel.app/")).rejects.toBeInstanceOf(HttpBadRequestError);
        expect(fake.calls).toEqual([]);
        expect(rows).toHaveLength(0);
    });

    it("segundo espaco no mesmo host responde 409 e nao chama o registrar", async () => {
        const { domains, rows } = memory(venues, [row("venue-a", "www.casa.com", "PENDING")]);
        const fake = registrar();
        await expect(
            new SaveVenueDomainUseCase(domains, allow, fake).execute("user-2", "Casa B", "https://www.casa.com/"),
        ).rejects.toBeInstanceOf(HttpConflictError);
        expect(fake.calls).toEqual([]);
        expect(rows.filter((item) => item.venueId === "venue-b")).toHaveLength(0);
        try {
            await new SaveVenueDomainUseCase(domains, allow, fake).execute("user-2", "Casa B", "www.casa.com");
        } catch (error) {
            expect(error).toBeInstanceOf(HttpConflictError);
            expect((error as Error).message).not.toContain("Casa A");
        }
    });

    it("usuario sem permissao recebe 403 e o registrar nao e chamado", async () => {
        const { domains, rows } = memory(venues);
        const fake = registrar();
        await expect(
            new SaveVenueDomainUseCase(domains, deny, fake).execute("user-1", "Casa A", "https://www.casa.com/"),
        ).rejects.toBeInstanceOf(HttpForbiddenError);
        expect(fake.calls).toEqual([]);
        expect(rows).toHaveLength(0);
    });
});

describe("resolver hostname", () => {
    const venues = [{ id: "venue-a", name: "Casa A" }];

    it("host pendente ou removido resolve 404 sem outra casa", async () => {
        const { domains } = memory(venues, [
            row("venue-a", "pendente.casa.com", "PENDING"),
            row("venue-a", "removido.casa.com", "REMOVED"),
        ]);
        const resolve = new ResolveVenueDomainUseCase(domains);
        await expect(resolve.execute("pendente.casa.com")).rejects.toBeInstanceOf(HttpResourceNotFoundError);
        await expect(resolve.execute("removido.casa.com")).rejects.toBeInstanceOf(HttpResourceNotFoundError);
        try {
            await resolve.execute("PENDENTE.casa.com");
        } catch (error) {
            expect(error).toBeInstanceOf(HttpResourceNotFoundError);
            expect((error as Error).message).not.toContain("Casa A");
            expect(JSON.stringify(error)).not.toContain("venue-a");
        }
    });

    it("host ativo devolve a casa certa", async () => {
        const { domains } = memory(venues, [row("venue-a", "www.casa.com", "ACTIVE")]);
        await expect(new ResolveVenueDomainUseCase(domains).execute("WWW.Casa.com:443")).resolves.toEqual({
            venueId: "venue-a",
            name: "Casa A",
        });
    });
});

describe("verificar e remover", () => {
    const venues = [{ id: "venue-a", name: "Casa A" }];

    it("verify verdadeiro marca ACTIVE e o resolve devolve a casa", async () => {
        const seeded = row("venue-a", "www.casa.com", "PENDING");
        const { domains } = memory(venues, [seeded]);
        const fake = registrar();
        fake.verify = async (hostname: string) => {
            fake.calls.push(`verify:${hostname}`);
            return true;
        };
        const saved = await new VerifyVenueDomainUseCase(domains, allow, fake).execute("user-1", "Casa A");
        expect(saved.data.status).toBe("ACTIVE");
        await expect(new ResolveVenueDomainUseCase(domains).execute("www.casa.com")).resolves.toEqual({
            venueId: "venue-a",
            name: "Casa A",
        });
    });

    it("verify falso nao marca ACTIVE", async () => {
        const { domains } = memory(venues, [row("venue-a", "www.casa.com", "PENDING")]);
        const saved = await new VerifyVenueDomainUseCase(domains, allow, registrar()).execute("user-1", "Casa A");
        expect(saved.data.status).toBe("PENDING");
        await expect(new ResolveVenueDomainUseCase(domains).execute("www.casa.com")).rejects.toBeInstanceOf(HttpResourceNotFoundError);
    });

    it("delete tira o hostname vivo e o resolve passa a 404", async () => {
        const { domains } = memory(venues, [row("venue-a", "www.casa.com", "ACTIVE")]);
        const fake = registrar();
        const saved = await new DeleteVenueDomainUseCase(domains, allow, fake).execute("user-1", "Casa A");
        expect(saved.data).toEqual({ hostname: null, status: null, verification: null });
        expect(fake.calls).toEqual(["remove:www.casa.com"]);
        await expect(new ResolveVenueDomainUseCase(domains).execute("www.casa.com")).rejects.toBeInstanceOf(HttpResourceNotFoundError);
    });
});

describe("leitura do dominio", () => {
    it("membro ve vazio e quem nao e membro recebe 403", async () => {
        const { domains } = memory([{ id: "venue-a", name: "Casa A" }]);
        const empty = await new GetVenueDomainUseCase(domains, allowRead).execute("user-1", "Casa A");
        expect(empty.data).toEqual({ hostname: null, status: null, verification: null });
        await expect(new GetVenueDomainUseCase(domains, denyRead).execute("user-1", "Casa A")).rejects.toBeInstanceOf(HttpForbiddenError);
    });
});

describe("rotas do dominio", () => {
    it("abre o resolve sem autenticacao e fecha a leitura e a gravacao", () => {
        const handlers = (path: string, method: "get" | "put" | "post" | "delete") => {
            const layer = (venueRoutes as unknown as {
                stack: { route?: { path: string; methods?: Record<string, boolean>; stack: { name: string; handle?: { name?: string } }[] } }[];
            }).stack.find((item) => item.route?.path === path && item.route.methods?.[method]);
            return layer?.route?.stack.map((entry) => entry.handle?.name || entry.name) ?? [];
        };

        expect(handlers("/domain/resolve", "get")).not.toContain("ensureAuthenticate");
        expect(handlers("/domain/:venueId", "get")).toContain("ensureAuthenticate");
        expect(handlers("/domain/:venueId", "put")).toContain("ensureAuthenticate");
        expect(handlers("/domain/:venueId/verify", "post")).toContain("ensureAuthenticate");
        expect(handlers("/domain/:venueId", "delete")).toContain("ensureAuthenticate");
    });
});
