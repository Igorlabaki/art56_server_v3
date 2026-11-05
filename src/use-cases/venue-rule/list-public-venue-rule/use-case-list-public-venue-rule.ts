import { HttpResourceNotFoundError } from "../../../errors/errors-type/http-resource-not-found-error";
import { VenueRuleRepositoryInterface } from "../../../repositories/interface/venue-rule-repository-interface";
import { VenueRepositoryInterface } from "../../../repositories/interface/venue-repository-interface";

export type PublicVenueRule = {
    id: string;
    title: string | null;
    text: string;
    position: number;
};

class ListPublicVenueRuleUseCase {
    constructor(
        private rules: Pick<VenueRuleRepositoryInterface, "listByVenue">,
        private venues: Pick<VenueRepositoryInterface, "getById">,
    ) {}

    async execute(venueId: string) {
        const venue = await this.venues.getById({ venueId });
        if (!venue) {
            throw new HttpResourceNotFoundError("Espaco");
        }

        const rules = await this.rules.listByVenue(venueId);
        const data: PublicVenueRule[] = rules.map((rule) => ({
            id: rule.id,
            title: rule.title,
            text: rule.text,
            position: rule.position,
        }));

        return {
            success: true as const,
            message: `Lista de regras com ${data.length} items`,
            data,
            count: data.length,
            type: "VenueRule" as const,
        };
    }
}

export { ListPublicVenueRuleUseCase };
