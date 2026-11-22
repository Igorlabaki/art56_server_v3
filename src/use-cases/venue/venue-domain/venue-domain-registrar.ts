export type VenueDomainChallenge = {
    type: string;
    name: string;
    value: string;
};

export class VenueDomainAttachError extends Error {
    constructor(readonly status: number) {
        super("domain request failed");
        this.name = "VenueDomainAttachError";
    }
}

export interface VenueDomainRegistrar {
    add(hostname: string): Promise<VenueDomainChallenge | null>;
    verify(hostname: string): Promise<boolean>;
    remove(hostname: string): Promise<void>;
}

export class DisabledVenueDomainRegistrar implements VenueDomainRegistrar {
    async add(): Promise<VenueDomainChallenge | null> {
        return null;
    }

    async verify(): Promise<boolean> {
        return false;
    }

    async remove(): Promise<void> {}
}
