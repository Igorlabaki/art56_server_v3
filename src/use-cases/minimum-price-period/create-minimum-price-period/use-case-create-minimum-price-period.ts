import { MinimumPricePeriodRepositoryInterface } from "../../../repositories/interface/minimum-price-period-repository-interface";
import { CreateMinimumPricePeriodRequestParams } from "../../../zod/minimumPricePeriod/create-minimum-price-period-params-schema";
import { VenuePriceAuthorizer } from "../venue-price-authorizer";

class CreateMinimumPricePeriodUseCase {
    constructor(
        private repository: MinimumPricePeriodRepositoryInterface,
        private authorizer: VenuePriceAuthorizer,
    ) {}

    async execute(userId: string | undefined, params: CreateMinimumPricePeriodRequestParams) {
        await this.authorizer.assert(userId, params.venueId, "EDIT_VENUE_PRICES");
        const created = await this.repository.create(params);

        return {
            success: true,
            message: "Faixa de preco minimo cadastrada com sucesso",
            data: created,
            count: 1,
            type: "MinimumPricePeriod",
        };
    }
}

export { CreateMinimumPricePeriodUseCase };
