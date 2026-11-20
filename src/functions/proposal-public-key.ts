import { randomInt } from "crypto";
import { Prisma } from "@prisma/client";
import { isVenueIdKey } from "./venue-public-key";

export const PROPOSAL_PUBLIC_ALPHABET = "abcdefghjkmnpqrstuvwxyz23456789";
export const PROPOSAL_PUBLIC_CODE_LENGTH = 8;

const publicCodePattern = new RegExp(
    `^[${PROPOSAL_PUBLIC_ALPHABET}]{${PROPOSAL_PUBLIC_CODE_LENGTH}}$`
);

export type ProposalPublicLookup =
    | { kind: "id"; id: string }
    | { kind: "code"; code: string };

export function proposalPublicLabel(name: string): string {
    return name
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-+|-+$/g, "");
}

export function generateProposalPublicCode(
    draw: (upperBound: number) => number = (upperBound) => randomInt(upperBound)
): string {
    let code = "";
    for (let index = 0; index < PROPOSAL_PUBLIC_CODE_LENGTH; index += 1) {
        code += PROPOSAL_PUBLIC_ALPHABET[draw(PROPOSAL_PUBLIC_ALPHABET.length)];
    }
    return code;
}

export function proposalPublicLookup(key: string): ProposalPublicLookup | null {
    const value = key.trim();
    if (isVenueIdKey(value)) return { kind: "id", id: value };
    const segment = value.split("-").at(-1) ?? "";
    if (publicCodePattern.test(segment)) return { kind: "code", code: segment };
    return null;
}

export async function resolveProposalId(
    key: string,
    findIdByCode: (code: string) => Promise<string | null>
): Promise<string | null> {
    const lookup = proposalPublicLookup(key);
    if (!lookup) return null;
    if (lookup.kind === "id") return lookup.id;
    return findIdByCode(lookup.code);
}

export function isProposalPublicCodeCollision(error: unknown): boolean {
    if (!(error instanceof Prisma.PrismaClientKnownRequestError) || error.code !== "P2002") return false;
    const target = error.meta?.target;
    const fields = Array.isArray(target) ? target : [target];
    return fields.some((field) => String(field).includes("publicCode"));
}

export async function createWithUniquePublicCode<T>(
    write: (code: string) => Promise<T>,
    draw: (upperBound: number) => number = (upperBound) => randomInt(upperBound),
    attempts = 5
): Promise<T> {
    let lastError: unknown;
    for (let attempt = 0; attempt < attempts; attempt += 1) {
        try {
            return await write(generateProposalPublicCode(draw));
        } catch (error) {
            lastError = error;
            if (!isProposalPublicCodeCollision(error) || attempt === attempts - 1) throw error;
        }
    }
    throw lastError;
}
