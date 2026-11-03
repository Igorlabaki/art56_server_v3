import { MinimumPricePeriodRepositoryInterface } from "../../../repositories/interface/minimum-price-period-repository-interface";
import { VenuePriceAuthorizer } from "../venue-price-authorizer";

class ListMinimumPricePeriodUseCase {
    constructor(
        private repository: MinimumPricePeriodRepositoryInterface,
        private authorizer: VenuePriceAuthorizer,
    ) {}

    async execute(userId: string | undefined, venueId: string) {
        await this.authorizer.assert(userId, venueId, "VIEW_VENUE_PRICES");
        const minimumPricePeriodList = await this.repository.list(venueId);

        return {
            success: true,
            message: `Lista de faixas de preco minimo com ${minimumPricePeriodList.length} items`,
            data: { minimumPricePeriodList },
            count: minimumPricePeriodList.length,
            type: "List",
        };
    }
}

export { ListMinimumPricePeriodUseCase };
