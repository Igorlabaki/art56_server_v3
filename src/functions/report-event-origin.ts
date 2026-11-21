export interface EventOriginRow {
  city: string | null;
  state: string | null;
  neighborhood: string | null;
}

export interface EventOriginPlace {
  label: string;
  count: number;
}

export interface EventOriginData {
  year: number;
  events: number;
  cities: EventOriginPlace[];
  states: EventOriginPlace[];
  neighborhoods: EventOriginPlace[];
}

function trimmed(value: string | null): string | null {
  if (value == null) return null;
  const text = value.trim();
  return text.length > 0 ? text : null;
}

function rank(labels: string[]): EventOriginPlace[] {
  const groups = new Map<string, EventOriginPlace>();
  for (const label of labels) {
    const key = label.toLocaleLowerCase("pt-BR");
    const current = groups.get(key);
    if (current) current.count += 1;
    else groups.set(key, { label, count: 1 });
  }
  return [...groups.values()].sort((a, b) => b.count - a.count || a.label.localeCompare(b.label, "pt-BR"));
}

/** Cidade, estado e bairro dos eventos aprovados do ano. Linha incompleta fica de fora. */
export function buildEventOrigin(rows: EventOriginRow[], year: number): EventOriginData {
  const complete: { city: string; state: string; neighborhood: string }[] = [];
  for (const row of rows) {
    const city = trimmed(row.city);
    const state = trimmed(row.state);
    const neighborhood = trimmed(row.neighborhood);
    if (city && state && neighborhood) complete.push({ city, state, neighborhood });
  }

  return {
    year,
    events: complete.length,
    cities: rank(complete.map((row) => row.city)),
    states: rank(complete.map((row) => row.state)),
    neighborhoods: rank(complete.map((row) => row.neighborhood)),
  };
}
