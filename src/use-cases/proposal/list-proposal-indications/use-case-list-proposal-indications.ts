import { HttpResourceNotFoundError } from "../../../errors/errors-type/http-resource-not-found-error";
import {
    ProposalIndicationRepositoryInterface,
    PublicIndication,
} from "../../../repositories/interface/proposal-indication-repository-interface";

const PUBLIC_KEYS = [
    "id",
    "name",
    "role",
    "whatsapp",
    "email",
    "instagramUrl",
    "facebookUrl",
    "tiktokUrl",
    "url",
    "category",
    "logoUrl",
    "description",
] as const;

function toPublic(indication: PublicIndication): PublicIndication {
    const source = indication as PublicIndication & Record<string, unknown>;
    const acc = {} as PublicIndication;
    for (const key of PUBLIC_KEYS) {
        acc[key] = source[key] as never;
    }
    return acc;
}

export class ListProposalIndicationsUseCase {
    constructor(private indications: Pick<ProposalIndicationRepositoryInterface, "findProposal" | "list">) {}

    async execute(proposalId: string) {
        const proposal = await this.indications.findProposal(proposalId);
        if (!proposal) {
            throw new HttpResourceNotFoundError("Orcamento");
        }

        const indications = (await this.indications.list(proposal.id, proposal.venueId)).map(toPublic);
        return {
            success: true,
            message: `Indicacoes com ${indications.length} itens`,
            data: { indications },
            count: indications.length,
            type: "List",
        };
    }
}
