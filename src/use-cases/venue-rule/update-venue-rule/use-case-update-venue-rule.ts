import { HttpResourceNotFoundError } from "../../../errors/errors-type/http-resource-not-found-error";
import { VenueRuleRepositoryInterface } from "../../../repositories/interface/venue-rule-repository-interface";
import { UpdateVenueRuleParams } from "../../../zod/venue-rule/update-venue-rule-schema";
import { VenueRuleAuthorizer } from "../venue-rule-authorizer";

class UpdateVenueRuleUseCase {
    constructor(
        private repository: VenueRuleRepositoryInterface,
        private authorizer: VenueRuleAuthorizer,
    ) {}

    async execute(userId: string | undefined, params: UpdateVenueRuleParams) {
        const current = await this.repository.getById(params.ruleId);
        if (!current) {
            throw new HttpResourceNotFoundError("Regra");
        }

        await this.authorizer.assert(userId, current.venueId, "EDIT_VENUE_RULES");
        const updated = await this.repository.update({
            ...params,
            position: params.position ?? current.position,
        });

        return {
            success: true,
            message: "Regra atualizada com sucesso",
            data: updated,
            count: 1,
            type: "VenueRule",
        };
    }
}

export { UpdateVenueRuleUseCase };
