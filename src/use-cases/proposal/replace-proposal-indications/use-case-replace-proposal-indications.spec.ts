import { describe, expect, it, vi } from "vitest";
import { HttpBadRequestError } from "../../../errors/errors-type/htttp-bad-request-error";
import { HttpForbiddenError } from "../../../errors/errors-type/http-forbidden-error";
import { HttpResourceNotFoundError } from "../../../errors/errors-type/http-resource-not-found-error";
import { HttpTokenError } from "../../../errors/errors-type/http-token-error";
import { ensureAuthenticate } from "../../../middleware/ensureAuthenticate";
import {
    IndicationContactRecord,
    ProposalIndicationRepositoryInterface,
} from "../../../repositories/interface/proposal-indication-repository-interface";
import { UserVenuePermissionRepositoryInterface } from "../../../repositories/interface/user-venue-permission-repository-interface";
import { proposalRoutes } from "../../../router/proposal";
import { ReplaceProposalIndicationsUseCase } from "./use-case-replace-proposal-indications";

const secret = {
    name: "Parceiro Secreto",
    whatsapp: "+5511999999999",
    email: "segredo@example.com",
};

function supplier(id: string, venueId = "venue-1"): IndicationContactRecord {
    return {
        id,
        name: secret.name,
        role: "Buffet",
        whatsapp: secret.whatsapp,
        email: secret.email,
        instagramUrl: null,
        facebookUrl: null,
        tiktokUrl: null,
        url: null,
        venueId,
        type: "SUPPLIER",
    };
}

function harness(options?: {
    proposal?: { id: string; venueId: string; organizationId: string } | null;
    contacts?: IndicationContactRecord[];
    permissions?: string | null;
    permissionVenueId?: string;
}) {
    const stored: string[][] = [];
    const proposal = options && "proposal" in options
        ? options.proposal ?? null
        : { id: "proposal-1", venueId: "venue-1", organizationId: "org-1" };
    const indications = {
        findProposal: async () => proposal,
        findContacts: async () => options?.contacts ?? [supplier("a"), supplier("b"), supplier("c")],
        replace: async (_proposalId: string, contactIds: string[]) => {
            stored.push(contactIds);
        },
        list: async () => [],
    } as ProposalIndicationRepositoryInterface;
    const permissions = {
        getUserVenuePermission: async ({ venueId }) => {
            if (options?.permissionVenueId && venueId !== options.permissionVenueId) return null;
            if (options?.permissions === null) return null;
            return { permissions: options?.permissions ?? "SEND_PROPOSAL_INFO" };
        },
    } as unknown as Pick<UserVenuePermissionRepositoryInterface, "getUserVenuePermission">;
    return {
        stored,
        useCase: new ReplaceProposalIndicationsUseCase(indications, permissions),
    };
}

describe("gravar indicacoes do orcamento", () => {
    it("PUT sem token responde 401", () => {
        const layer = proposalRoutes.stack.find((item) => item.route?.path === "/indications/:proposalId" && item.route.methods.put);
        const ensure = layer?.route?.stack[0]?.handle;
        expect(ensure).toBe(ensureAuthenticate);
        const status = vi.fn(() => ({ json: vi.fn() }));
        ensureAuthenticate({ headers: {} } as never, { status } as never, () => {
            throw new Error("nao deveria seguir");
        });
        expect(status).toHaveBeenCalledWith(401);
    });

    it("sem usuario responde 401 e nao grava", async () => {
        const { useCase, stored } = harness();
        await expect(useCase.execute({ proposalId: "proposal-1", contactIds: ["a"], userId: null })).rejects.toBeInstanceOf(HttpTokenError);
        expect(stored).toHaveLength(0);
    });

    it("orcamento inexistente responde 404 e nao grava", async () => {
        const { useCase, stored } = harness({ proposal: null });
        await expect(useCase.execute({ proposalId: "ausente", contactIds: ["a"], userId: "user-1" })).rejects.toBeInstanceOf(HttpResourceNotFoundError);
        expect(stored).toHaveLength(0);
    });

    it("sem a permissao daquele espaco responde 403 e nao grava", async () => {
        const { useCase, stored } = harness({ permissions: "VIEW_PROPOSAL_INFO", permissionVenueId: "venue-1" });
        await expect(useCase.execute({ proposalId: "proposal-1", contactIds: ["a"], userId: "user-2" })).rejects.toBeInstanceOf(HttpForbiddenError);
        expect(stored).toHaveLength(0);
    });

    it("permissao em outro espaco responde 403 e nao grava", async () => {
        const { useCase, stored } = harness({ permissionVenueId: "outro-espaco" });
        await expect(useCase.execute({ proposalId: "proposal-1", contactIds: ["a"], userId: "user-1" })).rejects.toBeInstanceOf(HttpForbiddenError);
        expect(stored).toHaveLength(0);
    });

    it("contato inexistente, de equipe ou de outro espaco responde 400 e nao grava", async () => {
        const errorLog = vi.spyOn(console, "error").mockImplementation(() => undefined);
        const samples = [
            { contacts: [{ ...supplier("equipe"), type: "TEAM_MEMBER" as const }], ids: ["equipe"] },
            { contacts: [supplier("outro", "venue-2")], ids: ["outro"] },
            { contacts: [supplier("a")], ids: ["fantasma"] },
        ];
        for (const sample of samples) {
            const { useCase, stored } = harness({ contacts: sample.contacts });
            await expect(useCase.execute({
                proposalId: "proposal-1",
                contactIds: sample.ids,
                userId: "user-1",
            })).rejects.toBeInstanceOf(HttpBadRequestError);
            expect(stored).toHaveLength(0);
        }
        const serialized = JSON.stringify(errorLog.mock.calls);
        expect(serialized).not.toContain(secret.name);
        expect(serialized).not.toContain(secret.whatsapp);
        expect(serialized).not.toContain(secret.email);
        errorLog.mockRestore();
    });

    it("conjunto novo substitui o anterior na ordem, sem id repetido", async () => {
        const { useCase, stored } = harness();
        const first = await useCase.execute({ proposalId: "proposal-1", contactIds: ["b", "a", "b"], userId: "user-1" });
        const second = await useCase.execute({ proposalId: "proposal-1", contactIds: ["c"], userId: "user-1" });
        expect(first.data.contactIds).toEqual(["b", "a"]);
        expect(second.data.contactIds).toEqual(["c"]);
        expect(stored).toEqual([["b", "a"], ["c"]]);
    });

    it("lista vazia zera os vinculos", async () => {
        const { useCase, stored } = harness();
        const result = await useCase.execute({ proposalId: "proposal-1", contactIds: [], userId: "user-1" });
        expect(result.data.contactIds).toEqual([]);
        expect(stored).toEqual([[]]);
    });

    it("o mesmo conjunto gravado duas vezes termina igual", async () => {
        const { useCase, stored } = harness();
        const first = await useCase.execute({ proposalId: "proposal-1", contactIds: ["a", "c"], userId: "user-1" });
        const second = await useCase.execute({ proposalId: "proposal-1", contactIds: ["a", "c"], userId: "user-1" });
        expect(second.data.contactIds).toEqual(first.data.contactIds);
        expect(stored[0]).toEqual(stored[1]);
    });
});
