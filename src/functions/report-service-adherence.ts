export interface ServiceAdherenceProposal {
  proposalServices: {
    serviceId: string;
    amount: number | null;
    service: { name: string };
  }[];
}

export interface ServiceAdherenceItem {
  serviceId: string;
  name: string;
  proposals: number;
  adherence: number;
  amountSum: number | null;
  linesWithAmount: number;
  linesTotal: number;
}

export interface ServiceAdherenceData<Filter extends string = string> {
  year: number;
  eventCategory: Filter | null;
  approvedProposals: number;
  services: ServiceAdherenceItem[];
}

/**
 * Adesao = propostas aprovadas distintas com o servico / propostas aprovadas.
 * Linha com `amount` 0 conta como valor registrado; `null` nao entra na soma.
 */
export function buildServiceAdherence<Filter extends string>(
  proposals: ServiceAdherenceProposal[],
  year: number,
  eventCategory: Filter | null = null,
): ServiceAdherenceData<Filter> {
  const byService = new Map<string, { name: string; proposals: number; amountSum: number; linesWithAmount: number; linesTotal: number }>();

  for (const proposal of proposals) {
    const seen = new Set<string>();
    for (const line of proposal.proposalServices) {
      let item = byService.get(line.serviceId);
      if (!item) {
        item = { name: line.service.name, proposals: 0, amountSum: 0, linesWithAmount: 0, linesTotal: 0 };
        byService.set(line.serviceId, item);
      }
      item.linesTotal += 1;
      if (line.amount !== null && line.amount !== undefined) {
        item.amountSum += line.amount;
        item.linesWithAmount += 1;
      }
      if (!seen.has(line.serviceId)) {
        seen.add(line.serviceId);
        item.proposals += 1;
      }
    }
  }

  const approvedProposals = proposals.length;
  const services: ServiceAdherenceItem[] = [...byService].map(([serviceId, item]) => ({
    serviceId,
    name: item.name,
    proposals: item.proposals,
    adherence: item.proposals / approvedProposals,
    amountSum: item.linesWithAmount > 0 ? item.amountSum : null,
    linesWithAmount: item.linesWithAmount,
    linesTotal: item.linesTotal,
  }));

  services.sort((a, b) =>
    b.proposals - a.proposals
    || (b.amountSum ?? -Infinity) - (a.amountSum ?? -Infinity)
    || a.name.localeCompare(b.name, "pt-BR"));

  return { year, eventCategory, approvedProposals, services };
}
