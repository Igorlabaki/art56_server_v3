import { logDomainEvent } from "../../../functions/domain-log";
import { VenueDomainAttachError, VenueDomainChallenge, VenueDomainRegistrar } from "./venue-domain-registrar";

const TIMEOUT_MS = 10_000;
const RETRIES = 2;

export type VercelDomainConfig = {
    token: string;
    teamId: string;
    projectId: string;
};

export class VercelDomainRequestError extends VenueDomainAttachError {
    constructor(status: number, readonly code: string) {
        super(status);
        this.name = "VercelDomainRequestError";
    }
}

export function readVercelDomainConfig(env: NodeJS.ProcessEnv = process.env): VercelDomainConfig | null {
    const token = env.VERCEL_TOKEN?.trim() ?? "";
    const teamId = env.VERCEL_TEAM_ID?.trim() ?? "";
    const projectId = env.VERCEL_PROJECT_ID?.trim() ?? "";
    if (!token || !teamId || !projectId) return null;
    return { token, teamId, projectId };
}

type FetchLike = (url: string, init: RequestInit) => Promise<{ status: number; json: () => Promise<unknown> }>;

function challengeFrom(body: unknown): VenueDomainChallenge | null {
    const verification = (body as { verification?: Array<{ type?: string; domain?: string; value?: string }> } | null)?.verification?.[0];
    if (!verification?.type || !verification.domain || !verification.value) return null;
    return { type: verification.type, name: verification.domain, value: verification.value };
}

export class VercelVenueDomainRegistrar implements VenueDomainRegistrar {
    constructor(
        private readonly config: VercelDomainConfig | null,
        private readonly fetchImpl: FetchLike = (url, init) => fetch(url, init),
        private readonly sleep: (ms: number) => Promise<void> = (ms) => new Promise((resolve) => setTimeout(resolve, ms)),
    ) {}

    async add(hostname: string): Promise<VenueDomainChallenge | null> {
        if (!this.config) return null;
        const body = await this.request("POST", this.collectionPath(), { name: hostname }, hostname);
        logDomainEvent("domain.add", { hostname });
        return challengeFrom(body);
    }

    async verify(hostname: string): Promise<boolean> {
        if (!this.config) return false;
        try {
            const body = await this.request("GET", this.domainPath(hostname), undefined, hostname);
            const verified = (body as { verified?: boolean } | null)?.verified === true;
            logDomainEvent("domain.verify", { hostname });
            return verified;
        } catch (error) {
            if (error instanceof VercelDomainRequestError && error.status < 500) return false;
            throw error;
        }
    }

    async remove(hostname: string): Promise<void> {
        if (!this.config) return;
        await this.request("DELETE", this.domainPath(hostname), undefined, hostname);
        logDomainEvent("domain.remove", { hostname });
    }

    private collectionPath() {
        return `/v10/projects/${encodeURIComponent(this.config!.projectId)}/domains?teamId=${encodeURIComponent(this.config!.teamId)}`;
    }

    private domainPath(hostname: string) {
        return `/v9/projects/${encodeURIComponent(this.config!.projectId)}/domains/${encodeURIComponent(hostname)}?teamId=${encodeURIComponent(this.config!.teamId)}`;
    }

    private async request(method: "GET" | "POST" | "DELETE", path: string, body: unknown, hostname: string): Promise<unknown> {
        let lastError: unknown;
        for (let attempt = 0; attempt <= RETRIES; attempt += 1) {
            try {
                const response = await this.fetchImpl(`https://api.vercel.com${path}`, {
                    method,
                    headers: {
                        Authorization: `Bearer ${this.config!.token}`,
                        "Content-Type": "application/json",
                    },
                    body: body === undefined ? undefined : JSON.stringify(body),
                    signal: AbortSignal.timeout(TIMEOUT_MS),
                });
                if (response.status === 404 && method === "DELETE") return null;
                if (response.status === 409 && method === "POST") {
                    const payload = await response.json().catch(() => ({}));
                    const code = (payload as { error?: { code?: string } }).error?.code ?? "";
                    if (code === "domain_already_in_use") throw new VercelDomainRequestError(409, code);
                    return this.request("GET", this.domainPath(hostname), undefined, hostname);
                }
                if (response.status >= 500) {
                    lastError = new VercelDomainRequestError(response.status, "upstream");
                    if (attempt < RETRIES) {
                        await this.sleep(50 * (attempt + 1));
                        continue;
                    }
                    throw lastError;
                }
                if (response.status >= 400) {
                    throw new VercelDomainRequestError(response.status, "rejected");
                }
                if (response.status === 204) return null;
                return await response.json();
            } catch (error) {
                if (error instanceof VercelDomainRequestError && error.status < 500) throw error;
                lastError = error;
                if (attempt < RETRIES) {
                    await this.sleep(50 * (attempt + 1));
                    continue;
                }
                throw error;
            }
        }
        throw lastError;
    }
}
