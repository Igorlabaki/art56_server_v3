import { readFileSync } from "fs";
import { Prisma } from "@prisma/client";
import { describe, expect, it } from "vitest";
import {
    PROPOSAL_PUBLIC_ALPHABET,
    PROPOSAL_PUBLIC_CODE_LENGTH,
    createWithUniquePublicCode,
    generateProposalPublicCode,
    proposalPublicLabel,
    proposalPublicLookup,
    resolveProposalId,
} from "./proposal-public-key";

const oldId = "7a6974ae-d08f-4b9b-97a4-ccf3998aa7e7";

describe("proposal public code", () => {
    it("turns the client name into a label and omits an empty one", () => {
        expect(proposalPublicLabel("Maria Silva")).toBe("maria-silva");
        expect(proposalPublicLabel("José da Silva")).toBe("jose-da-silva");
        expect(proposalPublicLabel("  ")).toBe("");
    });

    it("draws 8 characters from the alphabet and never a counter", () => {
        const code = generateProposalPublicCode(() => 0);
        expect(code).toHaveLength(PROPOSAL_PUBLIC_CODE_LENGTH);
        expect(code).toBe("a".repeat(8));
        for (const character of code) {
            expect(PROPOSAL_PUBLIC_ALPHABET.includes(character)).toBe(true);
        }
        expect(PROPOSAL_PUBLIC_ALPHABET).not.toMatch(/[01oli]/);
    });

    it("gives two equal names different codes", async () => {
        let cursor = 0;
        const draw = () => cursor++;
        const first = await createWithUniquePublicCode(async (code) => code, draw);
        const second = await createWithUniquePublicCode(async (code) => code, draw);
        expect(first).not.toBe(second);
        expect(first).toHaveLength(8);
        expect(second).toHaveLength(8);
    });

    it("finds the proposal by the code even when the label is wrong", async () => {
        const lookup = proposalPublicLookup("joao-souza-k7m2abcd");
        expect(lookup).toEqual({ kind: "code", code: "k7m2abcd" });
        const id = await resolveProposalId("casa-errada-k7m2abcd", async (code) => code === "k7m2abcd" ? oldId : null);
        expect(id).toBe(oldId);
    });

    it("does not open a sequential suffix", () => {
        expect(proposalPublicLookup("maria-silva-1")).toBeNull();
        expect(proposalPublicLookup("maria-silva")).toBeNull();
    });

    it("opens an old id that has no code", async () => {
        const lookup = proposalPublicLookup(oldId);
        expect(lookup).toEqual({ kind: "id", id: oldId });
        let asked = false;
        const id = await resolveProposalId(oldId, async () => {
            asked = true;
            return null;
        });
        expect(id).toBe(oldId);
        expect(asked).toBe(false);
    });

    it("retries when the code is already taken", async () => {
        let drawn = 0;
        const writes: string[] = [];
        const saved = await createWithUniquePublicCode(async (code) => {
            writes.push(code);
            if (code === "aaaaaaaa") {
                throw new Prisma.PrismaClientKnownRequestError("Unique constraint failed", {
                    code: "P2002",
                    clientVersion: "5.0.0",
                    meta: { target: ["publicCode"] },
                });
            }
            return code;
        }, () => {
            const index = drawn < 8 ? 0 : 1;
            drawn += 1;
            return index;
        });
        expect(writes).toEqual(["aaaaaaaa", "bbbbbbbb"]);
        expect(saved).toBe("bbbbbbbb");
    });

    it("resolves the public code before reading photos for reorder and choice", () => {
        const source = readFileSync("src/repositories/in-prisma/proposal-in-prisma-repository.ts", "utf8");
        const reorder = source.slice(
            source.indexOf("async listVenueImagesForReorder"),
            source.indexOf("async listVenueImageCatalog")
        );
        const choice = source.slice(
            source.indexOf("async listVenueImageCatalog"),
            source.indexOf("async applyImageChoice")
        );
        expect(reorder).toContain("proposalIdFromKey");
        expect(reorder).toContain("where: { id: proposalId }");
        expect(choice).toContain("proposalIdFromKey");
        expect(choice).toContain("where: { id: proposalId }");
    });
});
