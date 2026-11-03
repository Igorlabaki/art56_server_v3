import { VenueRuleRepositoryInterface } from "../../../repositories/interface/venue-rule-repository-interface";
import { VenueRuleAuthorizer } from "../venue-rule-authorizer";

class ListVenueRuleUseCase {
    constructor(
        private repository: VenueRuleRepositoryInterface,
        private authorizer: VenueRuleAuthorizer,
    ) {}

    async execute(userId: string | undefined, venueId: string) {
        await this.authorizer.assert(userId, venueId, "VIEW_VENUE_RULES");
        const rules = await this.repository.listByVenue(venueId);

        return {
            success: true,
            message: `Lista de regras com ${rules.length} items`,
            data: rules,
            count: rules.length,
            type: "VenueRule",
        };
    }
}

export { ListVenueRuleUseCase };
