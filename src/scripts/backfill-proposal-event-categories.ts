import { EventCategory, Prisma, PrismaClient } from "@prisma/client";

const readBatchSize = 250;
const writeBatchSize = 50;

function matchAny(patterns: RegExp[]): RegExp {
  return new RegExp("\\b(" + patterns.map((pattern) => pattern.source).join("|") + ")\\b");
}

const rules={
  WEDDING: matchAny([
    /casamentos?/,
    /matrimonio/,
    /mini[ -]?weddings?/,
    /weddings?/,
    /bodas/,
    /noivado/,
    /enlace/,
    /nupcias/,
    /renovacao (de )?votos/,
  ]),
  BACHELOR_PARTY: matchAny([
    /despedida (de|da|do) (solteir[oa]s?|noiv[oa])/,
    /bachelorette/,
    /bachelor party/,
  ]),
  BIRTHDAY: matchAny([
    /aniversarios?/,
    /niver/,
    /bday/,
    /birthday/,
    /debutantes?/,
    /debut/,
    /quinze anos/,
    /festa de (1|15|18|30|40|50|60|70|80|90|100) anos/,
    /festa infantil/,
    /festa de crianca/,
  ]),
  CORPORATE: matchAny([
    /corporativ[oa]s?/,
    /empresaria(is|l)/,
    /evento (da|de|para a) empresa/,
    /confraternizacao (da|de|para a) empresa/,
    /equipe da empresa/,
    /colaboradores/,
    /funcionarios/,
    /workshops?/,
    /treinamento/,
    /congresso/,
    /seminario/,
    /palestras?/,
    /simposio/,
    /convencao/,
    /reuniao (de trabalho|de equipe|de negocios)/,
    /team building/,
    /teambuilding/,
    /networking/,
    /evento (de|para) (clientes|negocios)/,
    /happy hour (da (empresa|equipe)|corporativo)/,
    /reuniao corporativa/,
    /evento interno/,
    /imersao (de |da )?(lideres|lideranca|equipe)/,
    /kick[ -]?off/,
  ]),
  COFFEE_BREAK: matchAny([
    /coffee[ -]?breaks?/,
    /coffee brake/,
    /pausa para cafe/,
  ]),
  OTHER: matchAny([
    /formaturas?/,
    /colacao de grau/,
    /cha (de )?(bebe|revelacao|fraldas|panela|cozinha|bar)/,
    /batiza[dm]o/,
    /batismo/,
    /primeira comunhao/,
    /crisma/,
    /bar mitzvah/,
    /bat mitzvah/,
    /reveillon/,
    /ano novo/,
    /p[a]scoa/,
    /retiro (espiritual|religioso|de yoga)/,
    /festa junina/,
    /ensaio fotografico/,
    /sessao (de fotos|fotografica)/,
    /gravacao (de|para)/,
    /filmagem/,
    /exposicao (de|artistica)/,
    /encontro (de familia|familiar|de amigos)/,
    /reuniao (de familia|familiar)/,
    /confraternizacao (em familia|de familia|familiar|entre amigos)/,
    /almoco (em familia|de familia|familiar)/,
    /ferias (em familia|escolares)/,
    /hospedagem (em familia|familiar)/,
    /viagem (em familia|de familia|familiar)/,
    /festa (a fantasia|de halloween|do pijama|de natal)/,
    /piquenique/,
  ]),
};

const refinements: Partial<Record<EventCategory, RegExp>> = {
  WEDDING: matchAny([
    /casar (no|em|e)/,
    /casar civil/,
    /casorio/,
    /anos de casad[oa]s?/,
    /cha (de )?(panela|cozinha|bar)/,
  ]),
  BACHELOR_PARTY: matchAny([
    /despedida (d[eo] )?solteir[oa]s?/,
    /bachelorette/,
    /bachelor party/,
    /cha (de )?lingerie/,
  ]),
  BIRTHDAY: matchAny([
    /aniversariantes?/,
    /aniverario/,
    /aniver/,
    /aniversaio/,
    /aniversrio/,
    /anivesario/,
    /aniverssario/,
    /aniversaro/,
    /festa (de )?(um|\d{1,3}) (an(inho|o)s?)/,
    /comemoracao de \d{1,3} anos/,
    /completar \d{1,3} anos/,
    /comemorar (meus |seus )?\d{1,3} anos/,
    /fazer (meus |seus )?\d{1,3} anos/,
  ]),
  CORPORATE: matchAny([
    /coorporativ[oa]s?/,
    /confraternizacao (da |de |para a )?(empresa|escritorio|do trabalho|do escritorio|do setor)/,
    /confra (da |de )?(empresa|equipe|do trabalho|do escritorio)/,
    /fim de ano da empresa/,
    /evento (de equipe|de trabalho|de lancamento|para uma empresa)/,
    /anos da empresa/,
    /lancamento de (marca|produto|colecao)/,
    /reuniao (da empresa|da equipe|de diretoria)/,
    /evento da equipe/,
    /evento da firma/,
    /festa da empresa/,
    /evento para (a )?(empresa|funcionarios)/,
  ]),
  OTHER: matchAny([
    /confraternizacao de (um (grande )?)?(grupo de )?(amigos|um grupo de formacao)/,
    /(?:churrasco|festa|almoco|comemoracao|lazer|tarde|encontro|reuniao|evento) (?:de |entre |em |com (?:a |os |meus |a minha )?|somente )?(?:familia(?:res)?|amigos|familiar)\b/,
    /comemorar com amigos/,
    /evento universitario/,
    /festa (de fim|do fim|de encerramento) de semestre/,
    /dia de los muertos/,
    /helloween/,
    /tarde de jogos/,
    /cha de bebe/,
  ]),
};

const extra: Partial<Record<EventCategory, RegExp>> = {
  WEDDING: matchAny([
    /celebracao de uniao estavel/,
    /festa de noivado/,
  ]),
  CORPORATE: matchAny([
    /confrat[e-z]*z[a-z]* .{0,48}\b(empresa|equipe|escritorio|trabalho|time)\b/,
    /fim de ano .{0,25}\b(empresa|escritorio|agencia)\b/,
    /reuni[a-z]+ (com (lideres da |a )?|de )?(empresa|time|equipe)/,
    /lanc+amento da? (colecao|marca|campanha)/,
    /festa (da nossa |da minha |de )empresa/,
    /evento pr?a empresa/,
    /churrasco (com o time da empresa|de equipe para comemorar resultados)/,
    /somos uma empresa/,
    /folga da equipe/,
    /encontro junino.{0,35}equipe/,
  ]),
  BIRTHDAY: matchAny([
    /niversario/,
    /aniversaria/,
    /aniv/,
    /festa [^.!?]{0,32}\b\d{1,3} anos/,
    /comemoracao \d{1,3} anos/,
    /(fara|fazendo) \d{1,3} anos/,
    /pool party de \d{1,3} anos/,
  ]),
  OTHER: matchAny([
    /cha de beb/,
    /formandos/,
    /hallowe?en/,
    /carnaval/,
    /passagem de natal/,
    /evento (social )?(pr?a|para|entre) .{0,22}\b(amigos|familia)/,
    /evento social,? para amigos/,
    /festa para amigos/,
    /almoco de domingo somente familia/,
    /feriado em familia/,
    /day use com (a )?familia/,
    /passar o dia com a familia/,
    /despedida (de um amigo|para familia)/,
    /churrasco pos igreja/,
    /confrat[a-z]*z[a-z]*.{0,24}\b(igreja|amigos|familia)\b/,
    /reuniao de amigas/,
    /ensaio de fotos/,
    /shooting para fotos/,
    /gravacao na area/,
    /fotos e ensaio/,
    /festa com criancas da igreja/,
    /eventos de familia/,
    /dia das criancas/,
  ]),
};

function classify(description: string): EventCategory | undefined {
  const text = description
    .replace(/<[^>]*>/g, " ")
    .replace(/&nbsp;|&#160;/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .normalize("NFD")
    .replace(/\p{M}/gu, "")
    .toLowerCase();

  const { BIRTHDAY, BACHELOR_PARTY, CORPORATE, COFFEE_BREAK, OTHER, WEDDING } = EventCategory;
  if (/^(confra(tr)?|confraternizacao)[. !]*$/.test(text)) return CORPORATE;

  const matches = Object.values(EventCategory).filter((category) =>
    [rules[category], refinements[category], extra[category]].some((pattern) => pattern?.test(text)),
  );

  if (matches.includes(CORPORATE) && matches.includes(BIRTHDAY) &&
      /\b(aniversario|anos) (de fundacao |de existencia )?(da empresa|da loja|da marca|da agencia|do escritorio|do grupo)\b/.test(text)) {
    return CORPORATE;
  }
  if (matches.includes(BACHELOR_PARTY) && /\bcha (de )?lingerie\b/.test(text) && !/\bdespedida\b/.test(text) &&
      !rules.BACHELOR_PARTY.test(text)) {
    return OTHER;
  }
  if (matches.length === 1) return matches[0];
  if (matches.length !== 2) return undefined;

  if (matches.includes(BIRTHDAY) && matches.includes(OTHER) && !/\b(formatura|cha de bebe)\b/.test(text)) {
    return BIRTHDAY;
  }
  if (matches.includes(CORPORATE) && matches.includes(OTHER) &&
      /\b(festa junina|corporativ[oa] halloween|confrat[a-z]*z[a-z]*.{0,60}\b(empresa|equipe|escritorio|trabalho|time))\b/.test(text)) {
    return CORPORATE;
  }
  if (matches.includes(BIRTHDAY) && matches.includes(CORPORATE) &&
      /\b(funcionarios que|servico de|funcionarios do buffet)\b/.test(text) && !/\bconfraternizacao\b/.test(text)) {
    return BIRTHDAY;
  }
  if (matches.includes(CORPORATE) && matches.includes(COFFEE_BREAK)) return CORPORATE;
  if (matches.includes(COFFEE_BREAK) && matches.includes(OTHER) && /\bconceito do evento: bloquinho de carnaval\b/.test(text)) {
    return OTHER;
  }
  if (matches.includes(WEDDING) && matches.includes(OTHER)) {
    if (/\bdo casamento no civil\b/.test(text)) return WEDDING;
    if (/\b(cha (de )?(panela|cozinha|bar)|noivado|uniao estavel)\b/.test(text)) {
      return rules.WEDDING.test(text) || extra.WEDDING?.test(text) ? WEDDING : OTHER;
    }
  }
  return undefined;
}

type ProposalDescription = { id: string; description: string };

async function applyCategory(
  prisma: PrismaClient, category: EventCategory, proposals: ProposalDescription[],
): Promise<number> {
  let updated = 0;
  for (let offset = 0; offset < proposals.length; offset += writeBatchSize) {
    const batch = proposals.slice(offset, offset + writeBatchSize);
    const matches = batch.map(({ id, description }) =>
      Prisma.sql(["(id = ", " AND BINARY description = BINARY ", ")"], id, description),
    );

    // Check the original text and category again in case the proposal was edited after the scan.
    updated += await prisma.$executeRaw(Prisma.sql(
      ["UPDATE proposal SET eventCategory = ", " WHERE eventCategory IS NULL AND (", ")"],
      category,
      Prisma.join(matches, " OR "),
    ));
  }
  return updated;
}

async function main(): Promise<void> {
  const args = process.argv.slice(2);
  const apply = args.length === 1 && args[0] === "--apply";
  if (args.length && !apply) {
    throw new Error("Uso: tsx src/scripts/backfill-proposal-event-categories.ts [--apply]");
  }

  const prisma = new PrismaClient();
  const counts = Object.fromEntries(Object.values(EventCategory).map((category) => [category, 0]));
  let cursor: string | undefined;
  let scanned = 0;
  let unmatched = 0;
  let updated = 0;

  try {
    for (;;) {
      const proposals: ProposalDescription[] = await prisma.proposal.findMany({
        where: {
          eventCategory: null,
          id: cursor === undefined ? undefined : { gt: cursor },
        },
        select: { id: true, description: true },
        orderBy: { id: "asc" },
        take: readBatchSize,
      });
      if (!proposals.length) break;

      scanned += proposals.length;
      cursor = proposals[proposals.length - 1].id;
      const candidates = new Map<EventCategory, ProposalDescription[]>();
      for (const proposal of proposals) {
        const category = classify(proposal.description);
        if (!category) {
          unmatched++;
          continue;
        }
        counts[category]++;
        const group = candidates.get(category) ?? [];
        group.push(proposal);
        candidates.set(category, group);
      }

      if (apply) {
        for (const [category, group] of candidates) {
          updated += await applyCategory(prisma, category, group);
        }
      }
    }

    console.log(JSON.stringify({
      mode: apply ? "apply" : "preview",
      scanned,
      candidates: scanned - unmatched,
      unmatched,
      byCategory: counts,
      ...(apply ? { updated, skippedAfterScan: scanned - unmatched - updated } : {}),
    }, null, 2));
  } finally {
    await prisma.$disconnect();
  }
}

main().catch((error: unknown) => {
  console.error(error instanceof Error ? error.message : error);
  process.exitCode = 1;
});

