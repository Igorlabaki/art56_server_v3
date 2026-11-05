import { describe, expect, it } from "vitest";
import { ZodError } from "zod";
import { VenueRule } from "@prisma/client";
import { HttpForbiddenError } from "../../errors/errors-type/http-forbidden-error";
import { HttpResourceNotFoundError } from "../../errors/errors-type/http-resource-not-found-error";
import { HttpTokenError } from "../../errors/errors-type/http-token-error";
import { VenueRuleRepositoryInterface } from "../../repositories/interface/venue-rule-repository-interface";
import { createVenueRuleSchema } from "../../zod/venue-rule/create-venue-rule-schema";
import { updateVenueRuleSchema } from "../../zod/venue-rule/update-venue-rule-schema";
import { CreateVenueRuleUseCase } from "./create-venue-rule/use-case-create-venue-rule";
import { DeleteVenueRuleUseCase } from "./delete-venue-rule/use-case-delete-venue-rule";
import { ListPublicVenueRuleUseCase } from "./list-public-venue-rule/use-case-list-public-venue-rule";
import { ListVenueRuleUseCase } from "./list-venue-rule/use-case-list-venue-rule";
import { UpdateVenueRuleUseCase } from "./update-venue-rule/use-case-update-venue-rule";
import { VenueRuleAuthorizer } from "./venue-rule-authorizer";
import { venueRuleRoutes } from "../../router/venue-rule";

function authorizerFor(permissionsByVenue: Record<string, string>) {
    return new VenueRuleAuthorizer(
        {
            getById: async ({ venueId }) => {
                if (venueId !== "venue-a" && venueId !== "venue-b") return null;
                return { organizationId: "org-1" } as never;
            },
        },
        {
            getUserVenuePermission: async ({ venueId }) => {
                const permissions = permissionsByVenue[venueId ?? ""];
                if (!permissions) return null;
                return { permissions } as never;
            },
        },
    );
}

class FakeVenueRuleRepository implements VenueRuleRepositoryInterface {
    items: VenueRule[] = [];
    updates = 0;
    deletes = 0;

    async create(params: { venueId: string; title: string | null; text: string; position: number }): Promise<VenueRule> {
        const row = {
            id: `rule-${this.items.length + 1}`,
            title: params.title,
            text: params.text,
            position: params.position,
            venueId: params.venueId,
            createdAt: new Date(2026, 0, this.items.length + 1),
            updatedAt: new Date(),
        };
        this.items.push(row);
        return row;
    }

    async listByVenue(venueId: string) {
        return this.items
            .filter((item) => item.venueId === venueId)
            .sort((a, b) => a.position - b.position || a.createdAt.getTime() - b.createdAt.getTime());
    }

    async getById(id: string) {
        return this.items.find((item) => item.id === id) ?? null;
    }

    async nextPosition(venueId: string) {
        const positions = this.items.filter((item) => item.venueId === venueId).map((item) => item.position);
        if (positions.length === 0) return 0;
        return Math.max(...positions) + 1;
    }

    async update(params: { ruleId: string; title: string | null; text: string; position: number }) {
        this.updates += 1;
        const current = await this.getById(params.ruleId);
        if (!current) throw new Error("missing");
        current.title = params.title;
        current.text = params.text;
        current.position = params.position;
        return current;
    }

    async delete(id: string) {
        this.deletes += 1;
        const current = await this.getById(id);
        if (!current) throw new Error("missing");
        this.items = this.items.filter((item) => item.id !== id);
        return current;
    }
}

const editor = authorizerFor({ "venue-a": "VIEW_VENUE_RULES,EDIT_VENUE_RULES" });
const viewer = authorizerFor({ "venue-a": "VIEW_VENUE_RULES" });
const otherVenue = authorizerFor({ "venue-b": "VIEW_VENUE_RULES,EDIT_VENUE_RULES" });

describe("venue rule", () => {
    it("cria no fim da lista e lista ordenada, inclusive vazia", async () => {
        const repository = new FakeVenueRuleRepository();
        const create = new CreateVenueRuleUseCase(repository, editor);
        const list = new ListVenueRuleUseCase(repository, editor);

        const empty = await list.execute("user-1", "venue-a");
        expect(empty.data).toEqual([]);

        await create.execute("user-1", { venueId: "venue-a", title: "Silencio", text: "Apos as 22h" });
        await create.execute("user-1", { venueId: "venue-a", title: null, text: "Sem som alto" });

        const listed = await list.execute("user-1", "venue-a");
        expect(listed.data.map((rule) => rule.position)).toEqual([0, 1]);
        expect(listed.data[1].text).toBe("Sem som alto");
    });

    it("recusa texto vazio e usuario sem token", () => {
        expect(() => createVenueRuleSchema.parse({ venueId: "venue-a", text: "   " })).toThrow(ZodError);
        expect(() => updateVenueRuleSchema.parse({ ruleId: "rule-1", text: "" })).toThrow(ZodError);

        const repository = new FakeVenueRuleRepository();
        const create = new CreateVenueRuleUseCase(repository, editor);
        return expect(create.execute(undefined, { venueId: "venue-a", title: null, text: "Regra" })).rejects.toBeInstanceOf(HttpTokenError);
    });

    it("recusa listar e gravar sem a permissao daquele venue", async () => {
        const repository = new FakeVenueRuleRepository();
        repository.items.push({
            id: "rule-1",
            title: "Som",
            text: "Sem som alto",
            position: 0,
            venueId: "venue-a",
            createdAt: new Date(),
            updatedAt: new Date(),
        });

        const list = new ListVenueRuleUseCase(repository, otherVenue);
        const update = new UpdateVenueRuleUseCase(repository, viewer);
        const remove = new DeleteVenueRuleUseCase(repository, otherVenue);

        await expect(list.execute("user-1", "venue-a")).rejects.toBeInstanceOf(HttpForbiddenError);
        await expect(update.execute("user-1", {
            ruleId: "rule-1",
            title: "Som",
            text: "Texto novo",
            position: 0,
        })).rejects.toBeInstanceOf(HttpForbiddenError);
        await expect(remove.execute("user-1", "rule-1")).rejects.toBeInstanceOf(HttpForbiddenError);
        expect(repository.updates).toBe(0);
        expect(repository.deletes).toBe(0);
        expect(repository.items[0].text).toBe("Sem som alto");
    });

    it("nao altera regra de outro venue e responde 404 quando nao existe", async () => {
        const repository = new FakeVenueRuleRepository();
        repository.items.push({
            id: "rule-1",
            title: null,
            text: "Original",
            position: 3,
            venueId: "venue-a",
            createdAt: new Date(),
            updatedAt: new Date(),
        });

        const update = new UpdateVenueRuleUseCase(repository, otherVenue);
        await expect(update.execute("user-1", {
            ruleId: "rule-1",
            title: null,
            text: "Invadida",
        })).rejects.toBeInstanceOf(HttpForbiddenError);
        expect(repository.items[0].text).toBe("Original");

        const missing = new UpdateVenueRuleUseCase(repository, editor);
        await expect(missing.execute("user-1", {
            ruleId: "nao-existe",
            title: null,
            text: "Texto",
        })).rejects.toBeInstanceOf(HttpResourceNotFoundError);
    });

    it("lista publica devolve so id, titulo, texto e posicao, sem authorizer", async () => {
        const repository = new FakeVenueRuleRepository();
        repository.items.push(
            {
                id: "rule-late",
                title: null,
                text: "<b>sem html</b>",
                position: 2,
                venueId: "venue-a",
                createdAt: new Date(2026, 0, 2),
                updatedAt: new Date(),
            },
            {
                id: "rule-first",
                title: "Horario",
                text: "Ate as 22h",
                position: 0,
                venueId: "venue-a",
                createdAt: new Date(2026, 0, 3),
                updatedAt: new Date(),
            },
            {
                id: "rule-other",
                title: "Outro",
                text: "Nao mostrar",
                position: 0,
                venueId: "venue-b",
                createdAt: new Date(2026, 0, 1),
                updatedAt: new Date(),
            },
        );
        const venues = {
            getById: async ({ venueId }: { venueId: string }) =>
                venueId === "venue-a" ? ({ id: venueId } as never) : null,
        };
        const list = new ListPublicVenueRuleUseCase(repository, venues);

        const listed = await list.execute("venue-a");
        expect(listed.data).toEqual([
            { id: "rule-first", title: "Horario", text: "Ate as 22h", position: 0 },
            { id: "rule-late", title: null, text: "<b>sem html</b>", position: 2 },
        ]);
        expect(listed.count).toBe(2);

        const emptyRepository = new FakeVenueRuleRepository();
        const empty = await new ListPublicVenueRuleUseCase(emptyRepository, venues).execute("venue-a");
        expect(empty.data).toEqual([]);

        await expect(list.execute("venue-x")).rejects.toBeInstanceOf(HttpResourceNotFoundError);
    });

    it("recusa listar e apagar sem token e publica a rota antes da autenticacao", async () => {
        const repository = new FakeVenueRuleRepository();
        repository.items.push({
            id: "rule-1",
            title: null,
            text: "Original",
            position: 0,
            venueId: "venue-a",
            createdAt: new Date(),
            updatedAt: new Date(),
        });
        const list = new ListVenueRuleUseCase(repository, editor);
        const remove = new DeleteVenueRuleUseCase(repository, editor);
        await expect(list.execute(undefined, "venue-a")).rejects.toBeInstanceOf(HttpTokenError);
        await expect(remove.execute(undefined, "rule-1")).rejects.toBeInstanceOf(HttpTokenError);
        expect(repository.deletes).toBe(0);

        const markers = (venueRuleRoutes as unknown as { stack: { name: string; route?: { path: string } }[] }).stack
            .map((layer) => layer.route?.path ?? layer.name);
        const authAt = markers.indexOf("ensureAuthenticate");
        expect(markers.indexOf("/public/:venueId")).toBeGreaterThanOrEqual(0);
        expect(authAt).toBeGreaterThan(markers.indexOf("/public/:venueId"));
        expect(markers.indexOf("/list/:venueId")).toBeGreaterThan(authAt);
        expect(markers.indexOf("/create")).toBeGreaterThan(authAt);
        expect(markers.indexOf("/update")).toBeGreaterThan(authAt);
        expect(markers.indexOf("/delete/:ruleId")).toBeGreaterThan(authAt);
    });
});
