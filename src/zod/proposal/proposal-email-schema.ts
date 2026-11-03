import { z } from "zod";

export const optionalProposalEmail = z.preprocess((value) => {
    if (value === undefined || value === null) return null;
    if (typeof value !== "string") return value;
    const trimmed = value.trim();
    return trimmed === "" ? null : trimmed;
}, z.string().email().nullable());

export const requiredProposalEmail = z.preprocess((value) => {
    if (typeof value !== "string") return value;
    return value.trim();
}, z.string().min(1).email());
