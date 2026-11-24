export type OriginLimiter = {
    allow(key: string): boolean;
};

export function createOriginLimiter(limit: number, windowMs: number, now: () => number = Date.now): OriginLimiter {
    const hits = new Map<string, number[]>();
    return {
        allow(key: string) {
            const at = now();
            const recent = (hits.get(key) ?? []).filter((stamp) => at - stamp < windowMs);
            if (recent.length >= limit) {
                hits.set(key, recent);
                return false;
            }
            recent.push(at);
            hits.set(key, recent);
            return true;
        },
    };
}

export const publicSurfaceViewLimiter = createOriginLimiter(60, 60_000);
