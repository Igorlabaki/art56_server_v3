import { HttpBadRequestError } from "../../../errors/errors-type/htttp-bad-request-error";
import { HttpForbiddenError } from "../../../errors/errors-type/http-forbidden-error";
import { HttpResourceNotFoundError } from "../../../errors/errors-type/http-resource-not-found-error";
import { HttpTokenError } from "../../../errors/errors-type/http-token-error";
import { ProposalIndicationRepositoryInterface } from "../../../repositories/interface/proposal-indication-repository-interface";
import { UserVenuePermissionRepositoryInterface } from "../../../repositories/interface/user-venue-permission-repository-interface";

const SEND_PROPOSAL_INFO = "SEND_PROPOSAL_INFO";

export type ReplaceProposalIndicationsInput = {
    proposalId: string;
    contactIds: string[];
    userId?: string | null;
};

function uniqueIds(ids: string[]) {
    const seen = new Set<string>();
    const ordered: string[] = [];
    for (const id of ids) {
        if (seen.has(id)) continue;
        seen.add(id);
        ordered.push(id);
    }
    return ordered;
}

function logRefusal(proposalId: string, count: number) {
    console.error("[proposal-indication]", { proposalId, count });
}

export class ReplaceProposalIndicationsUseCase {
    constructor(
        private indications: ProposalIndicationRepositoryInterface,
        private permissions: Pick<UserVenuePermissionRepositoryInterface, "getUserVenuePermission">,
    ) {}

    async execute({ proposalId, contactIds, userId }: ReplaceProposalIndicationsInput) {
        if (!userId) {
            throw new HttpTokenError();
        }

        const proposal = await this.indications.findProposal(proposalId);
        if (!proposal) {
            throw new HttpResourceNotFoundError("Orcamento");
        }

        const link = await this.permissions.getUserVenuePermission({
            userId,
            organizationId: proposal.organizationId,
            venueId: proposal.venueId,
        });
        const granted = (link?.permissions ?? "")
            .split(",")
            .map((item) => item.trim())
            .filter(Boolean);
        if (!granted.includes(SEND_PROPOSAL_INFO)) {
            logRefusal(proposalId, contactIds.length);
            throw new HttpForbiddenError("Voce nao tem permissao para indicar parceiros neste espaco.");
        }

        const ordered = uniqueIds(contactIds);
        if (ordered.length === 0) {
            await this.indications.replace(proposalId, []);
            return { success: true, message: "Indicacoes atualizadas", data: { contactIds: [] } };
        }

        const contacts = await this.indications.findContacts(ordered);
        const byId = new Map(contacts.map((contact) => [contact.id, contact]));
        const accepted = ordered.every((id) => {
            const contact = byId.get(id);
            return contact?.type === "SUPPLIER" && contact.venueId === proposal.venueId;
        });
        if (!accepted) {
            logRefusal(proposalId, contactIds.length);
            throw new HttpBadRequestError("So fornecedores deste espaco podem ser indicados.");
        }

        await this.indications.replace(proposalId, ordered);
        return { success: true, message: "Indicacoes atualizadas", data: { contactIds: ordered } };
    }
}
