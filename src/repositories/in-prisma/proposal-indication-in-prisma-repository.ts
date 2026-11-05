import { PrismaClient } from "@prisma/client";
import {
    IndicationContactRecord,
    ProposalIndicationContext,
    ProposalIndicationRepositoryInterface,
    PublicIndication,
} from "../interface/proposal-indication-repository-interface";

const publicContactSelect = {
    id: true,
    name: true,
    role: true,
    whatsapp: true,
    email: true,
    instagramUrl: true,
    facebookUrl: true,
    tiktokUrl: true,
    url: true,
    category: true,
    logoUrl: true,
    description: true,
} as const;

export class PrismaProposalIndicationRepository implements ProposalIndicationRepositoryInterface {
    constructor(private prisma: PrismaClient) {}

    async findProposal(proposalId: string): Promise<ProposalIndicationContext | null> {
        const proposal = await this.prisma.proposal.findUnique({
            where: { id: proposalId },
            select: {
                id: true,
                venueId: true,
                venue: { select: { organizationId: true } },
            },
        });
        if (!proposal) return null;
        return {
            id: proposal.id,
            venueId: proposal.venueId,
            organizationId: proposal.venue.organizationId,
        };
    }

    async findContacts(ids: string[]): Promise<IndicationContactRecord[]> {
        if (ids.length === 0) return [];
        const contacts = await this.prisma.contact.findMany({
            where: { id: { in: ids } },
            select: {
                ...publicContactSelect,
                venueId: true,
                type: true,
            },
        });
        return contacts.map((contact) => ({
            id: contact.id,
            name: contact.name,
            role: contact.role,
            whatsapp: contact.whatsapp,
            email: contact.email,
            instagramUrl: contact.instagramUrl,
            facebookUrl: contact.facebookUrl,
            tiktokUrl: contact.tiktokUrl,
            url: contact.url,
            venueId: contact.venueId,
            type: contact.type,
        }));
    }

    async replace(proposalId: string, contactIds: string[]): Promise<void> {
        await this.prisma.$transaction(async (tx) => {
            await tx.proposalIndication.deleteMany({ where: { proposalId } });
            if (contactIds.length === 0) return;
            await tx.proposalIndication.createMany({
                data: contactIds.map((contactId, position) => ({
                    proposalId,
                    contactId,
                    position,
                })),
            });
        });
    }

    async list(proposalId: string, venueId: string): Promise<PublicIndication[]> {
        const rows = await this.prisma.proposalIndication.findMany({
            where: {
                proposalId,
                contact: {
                    type: "SUPPLIER",
                    venueId,
                },
            },
            orderBy: { position: "asc" },
            select: { contact: { select: publicContactSelect } },
        });
        return rows.map((row) => row.contact);
    }
}
