export type ProposalIndicationContext = {
    id: string;
    venueId: string;
    organizationId: string;
};

export type IndicationContactRecord = {
    id: string;
    name: string;
    role: string | null;
    whatsapp: string;
    email: string | null;
    instagramUrl: string | null;
    facebookUrl: string | null;
    tiktokUrl: string | null;
    url: string | null;
    venueId: string;
    type: "TEAM_MEMBER" | "SUPPLIER" | null;
};

export type PublicIndication = {
    id: string;
    name: string;
    role: string | null;
    whatsapp: string;
    email: string | null;
    instagramUrl: string | null;
    facebookUrl: string | null;
    tiktokUrl: string | null;
    url: string | null;
    category: string | null;
    logoUrl: string | null;
    description: string | null;
};

export interface ProposalIndicationRepositoryInterface {
    findProposal: (proposalId: string) => Promise<ProposalIndicationContext | null>;
    findContacts: (ids: string[]) => Promise<IndicationContactRecord[]>;
    replace: (proposalId: string, contactIds: string[]) => Promise<void>;
    list: (proposalId: string, venueId: string) => Promise<PublicIndication[]>;
}
