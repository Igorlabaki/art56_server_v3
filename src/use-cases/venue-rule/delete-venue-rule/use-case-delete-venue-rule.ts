import { HttpResourceNotFoundError } from "../../../errors/errors-type/http-resource-not-found-error";
import { VenueRuleRepositoryInterface } from "../../../repositories/interface/venue-rule-repository-interface";
import { VenueRuleAuthorizer } from "../venue-rule-authorizer";

class DeleteVenueRuleUseCase {
    constructor(
        private repository: VenueRuleRepositoryInterface,
        private authorizer: VenueRuleAuthorizer,
    ) {}

    async execute(userId: string | undefined, ruleId: string) {
        const current = await this.repository.getById(ruleId);
        if (!current) {
            throw new HttpResourceNotFoundError("Regra");
        }

        await this.authorizer.assert(userId, current.venueId, "EDIT_VENUE_RULES");
        const deleted = await this.repository.delete(ruleId);

        return {
            success: true,
            message: "Regra removida com sucesso",
            data: deleted,
            count: 1,
            type: "VenueRule",
        };
    }
}

export { DeleteVenueRuleUseCase };
