import { readFileSync } from "fs";
import { describe, expect, it, vi } from "vitest";
import { VercelDomainRequestError, VercelVenueDomainRegistrar } from "./vercel-domain-registrar";

const config = { token: "secret-token", teamId: "team-1", projectId: "project-1" };

type Stored = {
    name: string;
    verified: boolean;
    verification: Array<{ type: string; domain: string; value: string }>;
};

function http() {
    const domains: Stored[] = [];
    const calls: string[] = [];
    let status = 200;
    const fetchImpl = async (url: string, init: RequestInit) => {
        calls.push(`${init.method} ${url}`);
        const name = init.body ? (JSON.parse(String(init.body)) as { name: string }).name : decodeURIComponent(url.split("/domains/")[1]?.split("?")[0] ?? "");
        if (status >= 400 && init.method === "POST") {
            return { status, json: async () => ({ error: { code: "rejected" } }) };
        }
        if (init.method === "POST") {
            if (domains.some((domain) => domain.name === name)) {
                return { status: 409, json: async () => ({ error: { code: "domain_already_exists" } }) };
            }
            const row: Stored = {
                name,
                verified: false,
                verification: [{ type: "TXT", domain: `_vercel.${name}`, value: "vc-value" }],
            };
            domains.push(row);
            return { status: 200, json: async () => row };
        }
        if (init.method === "DELETE") {
            const index = domains.findIndex((domain) => domain.name === name);
            if (index >= 0) domains.splice(index, 1);
            return { status: 200, json: async () => ({}) };
        }
        const row = domains.find((domain) => domain.name === name);
        return { status: row ? 200 : 404, json: async () => row ?? {} };
    };
    return {
        domains,
        calls,
        fetchImpl,
        fail(next: number) {
            status = next;
        },
    };
}

function client(fake = http(), env = config) {
    return new VercelVenueDomainRegistrar(env, fake.fetchImpl, async () => undefined);
}

describe("porta HTTP da Vercel", () => {
    it("add repetido no mesmo projeto nao cria segunda linha", async () => {
        const fake = http();
        const registrar = client(fake);
        await registrar.add("www.casa.com");
        await registrar.add("www.casa.com");
        expect(fake.domains).toHaveLength(1);
        expect(fake.calls.filter((call) => call.startsWith("POST"))).toHaveLength(2);
    });

    it("5xx repete no maximo duas vezes e 4xx nao repete", async () => {
        const down = http();
        down.fail(500);
        await expect(client(down).add("www.casa.com")).rejects.toBeInstanceOf(VercelDomainRequestError);
        expect(down.calls).toHaveLength(3);

        const rejected = http();
        rejected.fail(400);
        await expect(client(rejected).add("www.outro.com")).rejects.toMatchObject({ status: 400 });
        expect(rejected.calls).toHaveLength(1);
    });

    it("verify verdadeiro le o dominio e o log nao leva o token", async () => {
        const fake = http();
        const lines: string[] = [];
        const spy = vi.spyOn(console, "info").mockImplementation((line) => {
            lines.push(String(line));
        });
        const registrar = client(fake);
        await registrar.add("www.casa.com");
        fake.domains[0]!.verified = true;
        await expect(registrar.verify("www.casa.com")).resolves.toBe(true);
        spy.mockRestore();
        const logged = lines.join("\n");
        expect(logged).toContain("domain.add");
        expect(logged).toContain("domain.verify");
        expect(logged).not.toContain("secret-token");
        expect(logged).not.toContain("vc-value");
    });

    it("delete tira o hostname e ausencia dos envs nao chama a rede", async () => {
        const fake = http();
        const registrar = client(fake);
        await registrar.add("www.casa.com");
        await registrar.remove("www.casa.com");
        expect(fake.domains).toHaveLength(0);

        const quiet = http();
        const off = new VercelVenueDomainRegistrar(null, quiet.fetchImpl, async () => undefined);
        await expect(off.add("www.casa.com")).resolves.toBeNull();
        await expect(off.verify("www.casa.com")).resolves.toBe(false);
        await off.remove("www.casa.com");
        expect(quiet.calls).toEqual([]);
    });

    it("o cliente nao cita o token do analytics nem associa www.ar756.com", () => {
        const source = readFileSync("src/use-cases/venue/venue-domain/vercel-domain-registrar.ts", "utf8");
        const example = readFileSync(".env.example", "utf8");
        expect(source).not.toContain("VITE_VERCEL_API_TOKEN");
        expect(source).not.toContain("www.ar756.com");
        expect(example).toContain("VERCEL_TOKEN=");
        expect(example).toContain("VERCEL_TEAM_ID=");
        expect(example).toContain("VERCEL_PROJECT_ID=");
        expect(example).not.toMatch(/VERCEL_TOKEN=.+/);
    });
});
