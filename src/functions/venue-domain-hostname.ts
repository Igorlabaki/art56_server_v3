const LABEL = /^[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?$/;
const IPV4 = /^(?:\d{1,3}\.){3}\d{1,3}$/;

export type NormalizedHostname = { ok: true; hostname: string } | { ok: false };

export function normalizeVenueHostname(raw: string): NormalizedHostname {
    let value = raw.trim().toLowerCase();
    value = value.replace(/^[a-z][a-z0-9+.-]*:\/\//, "");
    if (value.endsWith("/")) value = value.slice(0, -1);
    if (value.endsWith(".")) value = value.slice(0, -1);
    if (!value || /[/:?#\\\s@]/.test(value) || value.includes(":")) return { ok: false };
    if (value === "localhost" || value.endsWith(".localhost")) return { ok: false };
    if (value === "vercel.app" || value.endsWith(".vercel.app")) return { ok: false };
    if (IPV4.test(value)) return { ok: false };
    const labels = value.split(".");
    if (labels.length < 2 || labels.some((label) => !LABEL.test(label))) return { ok: false };
    return { ok: true, hostname: value };
}

export function hostnameFromRequestHost(raw: string): string | null {
    let value = raw.trim().toLowerCase();
    value = value.replace(/^[a-z][a-z0-9+.-]*:\/\//, "");
    value = value.split("/")[0] ?? "";
    value = value.replace(/\.$/, "");
    value = value.replace(/:\d+$/, "");
    if (!value || value.includes(":") || value.includes("@")) return null;
    return value;
}
