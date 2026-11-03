import { VenueRuleRepositoryInterface } from "../../../repositories/interface/venue-rule-repository-interface";
import { CreateVenueRuleParams } from "../../../zod/venue-rule/create-venue-rule-schema";
import { VenueRuleAuthorizer } from "../venue-rule-authorizer";

class CreateVenueRuleUseCase {
    constructor(
        private repository: VenueRuleRepositoryInterface,
        private authorizer: VenueRuleAuthorizer,
    ) {}

    async execute(userId: string | undefined, params: CreateVenueRuleParams) {
        await this.authorizer.assert(userId, params.venueId, "EDIT_VENUE_RULES");
        const position = await this.repository.nextPosition(params.venueId);
        const created = await this.repository.create({ ...params, position });

        return {
            success: true,
            message: "Regra cadastrada com sucesso",
            data: created,
            count: 1,
            type: "VenueRule",
        };
    }
}

export { CreateVenueRuleUseCase };
