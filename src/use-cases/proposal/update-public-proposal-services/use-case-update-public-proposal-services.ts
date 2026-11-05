import { HttpBadRequestError } from "../../../errors/errors-type/htttp-bad-request-error";
import { HttpResourceNotFoundError } from "../../../errors/errors-type/http-resource-not-found-error";
import { calcEventDuration } from "../../../functions/calc-event-duration";
import { MAX_SERVICE_HOURS, quoteServiceLines, SERVICE_HOURS_MESSAGE, ServiceForQuote, serviceHoursMap, serviceHoursOverEventMessage, ServicePricingType, ServiceQuoteLine } from "../../../functions/quote-service-lines";
import { HistoryRepositoryInterface } from "../../../repositories/interface/history-repository-interface";
import { ProposalRepositoryInterface } from "../../../repositories/interface/proposal-repository-interface";
import { ServiceRepositoryInterface } from "../../../repositories/interface/service-repository-interface";

const CONFIRMED_MESSAGE = "Este orçamento já foi confirmado e não pode ser alterado.";
const FOREIGN_SERVICE_MESSAGE = "Um dos serviços não pertence a este espaço.";
const HISTORY_ACTION = "Cliente atualizou os serviços pelo link";

type StoredLine = {
    id: string;
    serviceId: string;
    amount?: number | null;
    unitPrice?: number | null;
    quantity?: number | null;
    pricingType?: ServicePricingType | null;
    service?: {
        name: string;
        rpaRequired: boolean;
        rpaMinPeople?: number | null;
    } | null;
};

type ProposalForServices = {
    id: string;
    venueId: string;
    approved?: boolean | null;
    paid?: boolean | null;
    guestNumber: number;
    startDate: Date;
    endDate: Date;
    totalAmount: number;
    proposalServices?: StoredLine[];
};

type CatalogService = ServiceForQuote & {
    name: string;
    rpaRequired: boolean;
    rpaMinPeople?: number | null;
};

export type PublicProposalServiceView = {
    id: string;
    serviceId: string;
    amount: number;
    service: {
        name: string;
        rpaRequired: boolean;
        rpaMinPeople: number | null;
    };
};

type UpdatePublicProposalServicesParams = {
    proposalId: string;
    serviceIds: string[];
    serviceHours?: { serviceId: string; hours: number }[];
};

class UpdatePublicProposalServicesUseCase {
    constructor(
        private serviceRepository: ServiceRepositoryInterface,
        private historyRepository: HistoryRepositoryInterface,
        private proposalRepository: ProposalRepositoryInterface,
    ) { }

    async list(proposalId: string) {
        const proposal = await this.loadProposal(proposalId);
        const catalog = await this.loadCatalog(proposal.venueId);
        const stored = new Map(storedLines(proposal).map((line) => [line.serviceId, line]));

        const ordered = [...catalog].sort((a, b) => pricingRank(a.pricingType) - pricingRank(b.pricingType));

        return {
            success: true as const,
            message: "Serviços do orçamento",
            data: {
                services: ordered.map((service) => {
                    const current = stored.get(service.id);
                    const quoted = this.quote(proposal, catalog, service.id);
                    const hourly = service.pricingType === "PER_HOUR";
                    return {
                        id: service.id,
                        name: service.name,
                        amount: typeof current?.amount === "number" ? current.amount : quoted.amount,
                        required: isRequired(service, proposal.guestNumber),
                        minPeople: service.rpaMinPeople ?? null,
                        selected: Boolean(current),
                        hourly,
                        hours: hourly && typeof current?.quantity === "number" ? current.quantity : null,
                    };
                }),
            },
        };
    }

    async execute(params: UpdatePublicProposalServicesParams) {
        const proposal = await this.loadProposal(params.proposalId);

        if (proposal.approved || proposal.paid) {
            throw new HttpBadRequestError(CONFIRMED_MESSAGE);
        }

        const catalog = await this.loadCatalog(proposal.venueId);
        const byId = new Map(catalog.map((service) => [service.id, service]));
        const requested = unique(params.serviceIds);
        const required = catalog
            .filter((service) => isRequired(service, proposal.guestNumber))
            .map((service) => service.id);
        const nextIds = unique([...requested, ...required]);

        const unknown = nextIds.find((serviceId) => !byId.has(serviceId));
        if (unknown) {
            throw new HttpBadRequestError(FOREIGN_SERVICE_MESSAGE);
        }

        const current = storedLines(proposal);
        const currentIds = unique(current.map((line) => line.serviceId));
        const currentById = new Map(current.map((line) => [line.serviceId, line]));
        const chosen = serviceHoursMap(params.serviceHours);
        const eventHours = calcEventDuration(proposal.startDate, proposal.endDate);
        if (sameSet(currentIds, nextIds) && hoursUnchanged(nextIds, byId, currentById, chosen)) {
            return this.currentResponse(proposal, catalog);
        }

        const orderedIds = catalog.map((service) => service.id).filter((serviceId) => nextIds.includes(serviceId));
        const serviceLines = orderedIds.map((serviceId) => {
            const existing = currentById.get(serviceId);
            const quoted = this.quote(proposal, catalog, serviceId);
            const catalogService = byId.get(serviceId);
            if (catalogService?.pricingType === "PER_HOUR") {
                const quantity = resolvePublicHours({
                    isNew: !existing,
                    chosen: Object.prototype.hasOwnProperty.call(chosen, serviceId) ? chosen[serviceId] : undefined,
                    stored: existing?.quantity,
                    eventHours,
                });
                const unitPrice = existing && typeof existing.unitPrice === "number" ? existing.unitPrice : quoted.unitPrice;
                return {
                    serviceId,
                    pricingType: existing?.pricingType ?? quoted.pricingType,
                    unitPrice,
                    quantity,
                    amount: unitPrice * quantity,
                };
            }
            if (existing && typeof existing.amount === "number") {
                return {
                    serviceId,
                    pricingType: existing.pricingType ?? quoted.pricingType,
                    unitPrice: typeof existing.unitPrice === "number" ? existing.unitPrice : quoted.unitPrice,
                    quantity: typeof existing.quantity === "number" ? existing.quantity : quoted.quantity,
                    amount: existing.amount,
                };
            }
            return quoted;
        });

        const oldSum = current.reduce((total, line) => {
            if (typeof line.amount === "number") return total + line.amount;
            return total + this.quote(proposal, catalog, line.serviceId).amount;
        }, 0);
        const newSum = serviceLines.reduce((total, line) => total + line.amount, 0);
        const totalAmount = proposal.totalAmount - oldSum + newSum;

        const updated = await this.proposalRepository.update({
            proposalId: proposal.id,
            data: {
                totalAmount,
                serviceIds: orderedIds,
                serviceLines,
            },
        });

        if (!updated) {
            throw new Error("Erro na conexao com o banco de dados");
        }

        await this.historyRepository.create({
            proposalId: updated.id,
            action: HISTORY_ACTION,
        });

        const saved = await this.proposalRepository.getById(updated.id);
        return {
            success: true as const,
            message: "Serviços atualizados",
            data: {
                id: updated.id,
                totalAmount,
                proposalServices: saved
                    ? this.visibleLines(saved as ProposalForServices, catalog, serviceLines)
                    : serviceLines.map((line) => this.visibleFromQuote(line, byId)),
            },
        };
    }

    private async loadProposal(proposalId: string): Promise<ProposalForServices> {
        const proposal = await this.proposalRepository.getById(proposalId);
        if (!proposal) {
            throw new HttpResourceNotFoundError("Orcamento");
        }
        return proposal as ProposalForServices;
    }

    private async loadCatalog(venueId: string): Promise<CatalogService[]> {
        const services = await this.serviceRepository.getByVenueId(venueId);
        return (services ?? []).map((service) => ({
            id: service.id,
            venueId: service.venueId,
            price: service.price,
            pricingType: service.pricingType,
            name: service.name,
            rpaRequired: service.rpaRequired,
            rpaMinPeople: service.rpaMinPeople,
        }));
    }

    private quote(proposal: ProposalForServices, catalog: CatalogService[], serviceId: string): ServiceQuoteLine {
        const [line] = quoteServiceLines({
            venueId: proposal.venueId,
            serviceIds: [serviceId],
            services: catalog,
            guestNumber: proposal.guestNumber,
            startDate: proposal.startDate,
            endDate: proposal.endDate,
        });
        return line;
    }

    private currentResponse(proposal: ProposalForServices, catalog: CatalogService[]) {
        const byId = new Map(catalog.map((service) => [service.id, service]));
        return {
            success: true as const,
            message: "Serviços atualizados",
            data: {
                id: proposal.id,
                totalAmount: proposal.totalAmount,
                proposalServices: storedLines(proposal).map((line) => {
                    const amount = typeof line.amount === "number"
                        ? line.amount
                        : this.quote(proposal, catalog, line.serviceId).amount;
                    return this.visibleStored(line, amount, byId);
                }),
            },
        };
    }

    private visibleLines(
        proposal: ProposalForServices,
        catalog: CatalogService[],
        written: ServiceQuoteLine[],
    ): PublicProposalServiceView[] {
        const byId = new Map(catalog.map((service) => [service.id, service]));
        const writtenById = new Map(written.map((line) => [line.serviceId, line]));
        return storedLines(proposal).map((line) => {
            const amount = typeof line.amount === "number"
                ? line.amount
                : writtenById.get(line.serviceId)?.amount ?? 0;
            return this.visibleStored(line, amount, byId);
        });
    }

    private visibleStored(
        line: StoredLine,
        amount: number,
        byId: Map<string, CatalogService>,
    ): PublicProposalServiceView {
        const catalog = byId.get(line.serviceId);
        return {
            id: line.id,
            serviceId: line.serviceId,
            amount,
            service: {
                name: line.service?.name ?? catalog?.name ?? "Serviço",
                rpaRequired: line.service?.rpaRequired ?? catalog?.rpaRequired ?? false,
                rpaMinPeople: line.service?.rpaMinPeople ?? catalog?.rpaMinPeople ?? null,
            },
        };
    }

    private visibleFromQuote(line: ServiceQuoteLine, byId: Map<string, CatalogService>): PublicProposalServiceView {
        const catalog = byId.get(line.serviceId);
        return {
            id: line.serviceId,
            serviceId: line.serviceId,
            amount: line.amount,
            service: {
                name: catalog?.name ?? "Serviço",
                rpaRequired: catalog?.rpaRequired ?? false,
                rpaMinPeople: catalog?.rpaMinPeople ?? null,
            },
        };
    }
}

const PRICING_RANK: Record<string, number> = {
    FIXED: 0,
    PER_HOUR: 1,
    PER_PERSON: 2,
};

function pricingRank(type: string | null | undefined) {
    if (!type) return PRICING_RANK.FIXED;
    return PRICING_RANK[type] ?? PRICING_RANK.FIXED;
}

function storedLines(proposal: ProposalForServices) {
    return proposal.proposalServices ?? [];
}

function isRequired(service: { rpaRequired: boolean; rpaMinPeople?: number | null }, guestNumber: number) {
    return Boolean(service.rpaRequired && service.rpaMinPeople != null && guestNumber >= service.rpaMinPeople);
}

function unique(ids: string[]) {
    return [...new Set(ids)];
}

function sameSet(left: string[], right: string[]) {
    if (left.length !== right.length) return false;
    const known = new Set(right);
    return left.every((id) => known.has(id));
}

function hoursUnchanged(
    nextIds: string[],
    byId: Map<string, CatalogService>,
    currentById: Map<string, StoredLine>,
    chosen: Record<string, number>,
) {
    return nextIds.every((serviceId) => {
        const service = byId.get(serviceId);
        if (service?.pricingType !== "PER_HOUR") return true;
        const stored = currentById.get(serviceId)?.quantity;
        const next = Object.prototype.hasOwnProperty.call(chosen, serviceId) ? chosen[serviceId] : stored;
        return typeof stored === "number" && next === stored;
    });
}

function resolvePublicHours(input: {
    isNew: boolean;
    chosen?: number;
    stored?: number | null;
    eventHours: number;
}) {
    const candidate = input.chosen !== undefined ? input.chosen : input.isNew ? undefined : input.stored;
    if (typeof candidate !== "number" || !Number.isInteger(candidate) || candidate < 0 || candidate > MAX_SERVICE_HOURS) {
        throw new HttpBadRequestError(SERVICE_HOURS_MESSAGE);
    }
    if (input.isNew && candidate < 1) {
        throw new HttpBadRequestError(SERVICE_HOURS_MESSAGE);
    }
    if (candidate === 0 && input.eventHours !== 0) {
        throw new HttpBadRequestError(SERVICE_HOURS_MESSAGE);
    }
    if (candidate > input.eventHours) {
        throw new HttpBadRequestError(serviceHoursOverEventMessage(input.eventHours));
    }
    return candidate;
}

export { UpdatePublicProposalServicesUseCase, HISTORY_ACTION };
