import { HttpResourceNotFoundError } from "../../../errors/errors-type/http-resource-not-found-error";
import { MinimumPricePeriodRepositoryInterface } from "../../../repositories/interface/minimum-price-period-repository-interface";
import { UpdateMinimumPricePeriodRequestParams } from "../../../zod/minimumPricePeriod/update-minimum-price-period-params-schema";
import { VenuePriceAuthorizer } from "../venue-price-authorizer";

class UpdateMinimumPricePeriodUseCase {
    constructor(
        private repository: MinimumPricePeriodRepositoryInterface,
        private authorizer: VenuePriceAuthorizer,
    ) {}

    async execute(userId: string | undefined, params: UpdateMinimumPricePeriodRequestParams) {
        const current = await this.repository.getById(params.id);
        if (!current) {
            throw new HttpResourceNotFoundError("Faixa de preco minimo");
        }

        await this.authorizer.assert(userId, current.venueId, "EDIT_VENUE_PRICES");
        const updated = await this.repository.update(params);

        return {
            success: true,
            message: "Faixa de preco minimo atualizada com sucesso",
            data: updated,
            count: 1,
            type: "MinimumPricePeriod",
        };
    }
}

export { UpdateMinimumPricePeriodUseCase };
