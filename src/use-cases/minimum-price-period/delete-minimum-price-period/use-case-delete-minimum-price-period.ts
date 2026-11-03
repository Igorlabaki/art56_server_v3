import { HttpResourceNotFoundError } from "../../../errors/errors-type/http-resource-not-found-error";
import { MinimumPricePeriodRepositoryInterface } from "../../../repositories/interface/minimum-price-period-repository-interface";
import { VenuePriceAuthorizer } from "../venue-price-authorizer";

class DeleteMinimumPricePeriodUseCase {
    constructor(
        private repository: MinimumPricePeriodRepositoryInterface,
        private authorizer: VenuePriceAuthorizer,
    ) {}

    async execute(userId: string | undefined, id: string) {
        const current = await this.repository.getById(id);
        if (!current) {
            throw new HttpResourceNotFoundError("Faixa de preco minimo");
        }

        await this.authorizer.assert(userId, current.venueId, "EDIT_VENUE_PRICES");
        const deleted = await this.repository.delete(id);

        return {
            success: true,
            message: "Faixa de preco minimo removida com sucesso",
            data: deleted,
            count: 1,
            type: "MinimumPricePeriod",
        };
    }
}

export { DeleteMinimumPricePeriodUseCase };
