import { isTourVideoUrl } from "../zod/venue/tour-video-url-schema";

export const VENUE_LINK_KINDS = [
    "PRESENTATION",
    "BUDGET_FORM",
    "RULES",
    "WHATSAPP",
    "EMAIL",
    "GOOGLE_MAPS",
    "TOUR_VIDEO",
    "ORGANIZATION_SITE",
    "SITE",
    "INSTAGRAM",
    "FACEBOOK",
    "TIKTOK",
    "YOUTUBE",
    "GOOGLE_BUSINESS",
    "PINTEREST",
    "LINKEDIN",
    "TRIPADVISOR",
    "AIRBNB",
    "MENU",
] as const;

export type VenueLinkKind = (typeof VENUE_LINK_KINDS)[number];

export const PASTED_VENUE_LINK_KINDS = [
    "SITE",
    "INSTAGRAM",
    "FACEBOOK",
    "TIKTOK",
    "YOUTUBE",
    "GOOGLE_BUSINESS",
    "PINTEREST",
    "LINKEDIN",
    "TRIPADVISOR",
    "AIRBNB",
    "MENU",
] as const satisfies readonly VenueLinkKind[];

export type VenueLinkCheckStatus = "green" | "amber" | "red";

export type VenueLinkCheck = {
    status: VenueLinkCheckStatus;
    href: string | null;
    message: string;
};

export type VenueLinkRow = {
    kind: VenueLinkKind;
    url: string | null;
    visible: boolean;
    position: number;
};

export type VenueLinkSource = {
    url?: string | null;
    instagramUrl?: string | null;
    facebookUrl?: string | null;
    tiktokUrl?: string | null;
    whatsappNumber?: string | null;
    email?: string | null;
    tourVideoUrl?: string | null;
    street?: string | null;
    streetNumber?: string | null;
    neighborhood?: string | null;
    city?: string | null;
    state?: string | null;
    organizationUrl?: string | null;
};

export type VenueLinkColumns = {
    url: string | null;
    instagramUrl: string | null;
    facebookUrl: string | null;
    tiktokUrl: string | null;
};

export const VENUE_LINK_LABEL: Record<VenueLinkKind, string> = {
    PRESENTATION: "Apresentação",
    BUDGET_FORM: "Fazer orçamento",
    RULES: "Regras",
    WHATSAPP: "WhatsApp",
    EMAIL: "E-mail",
    GOOGLE_MAPS: "Google Maps",
    TOUR_VIDEO: "Vídeo do tour",
    ORGANIZATION_SITE: "Site da organização",
    SITE: "Site",
    INSTAGRAM: "Instagram",
    FACEBOOK: "Facebook",
    TIKTOK: "TikTok",
    YOUTUBE: "YouTube",
    GOOGLE_BUSINESS: "Google Meu Negócio",
    PINTEREST: "Pinterest",
    LINKEDIN: "LinkedIn",
    TRIPADVISOR: "TripAdvisor",
    AIRBNB: "Airbnb",
    MENU: "Cardápio",
};

export const VENUE_LINK_SUBTITLE: Record<VenueLinkKind, string> = {
    PRESENTATION: "Conheça o espaço",
    BUDGET_FORM: "Peça um orçamento",
    RULES: "Veja as regras",
    WHATSAPP: "Fale pelo WhatsApp",
    EMAIL: "Envie um e-mail",
    GOOGLE_MAPS: "Veja no mapa",
    TOUR_VIDEO: "Assista ao tour",
    ORGANIZATION_SITE: "Abra o site",
    SITE: "Abra o site",
    INSTAGRAM: "Abra o Instagram",
    FACEBOOK: "Abra o Facebook",
    TIKTOK: "Abra o TikTok",
    YOUTUBE: "Abra o canal",
    GOOGLE_BUSINESS: "Veja no Google",
    PINTEREST: "Abra o Pinterest",
    LINKEDIN: "Abra o LinkedIn",
    TRIPADVISOR: "Veja no TripAdvisor",
    AIRBNB: "Veja no Airbnb",
    MENU: "Abra o cardápio",
};

const PUBLIC_HOST = "https://event-hub-dashboard.vercel.app";
const PASTED = new Set<VenueLinkKind>(PASTED_VENUE_LINK_KINDS);

export function isPastedVenueLink(kind: VenueLinkKind) {
    return PASTED.has(kind);
}

export function venueLinkSourceHint(kind: VenueLinkKind): string | null {
    switch (kind) {
        case "WHATSAPP":
            return "Preencha o WhatsApp em Geral.";
        case "EMAIL":
            return "Preencha o e-mail em Geral.";
        case "GOOGLE_MAPS":
            return "Preencha o endereço em Endereço.";
        case "TOUR_VIDEO":
            return "Preencha o vídeo do tour em Apresentação.";
        default:
            return isPastedVenueLink(kind) ? "Cole o link." : null;
    }
}

export function checkVenueLinkUrl(kind: VenueLinkKind, raw: string): VenueLinkCheck {
    if (!isPastedVenueLink(kind)) {
        return { status: "red", href: null, message: "Esse tipo não usa um link colado." };
    }
    const href = withScheme(raw);
    if (!href) {
        return { status: "red", href: null, message: "Cole o link." };
    }
    const parsed = parseHttp(href);
    if (!parsed) {
        return { status: "red", href: null, message: "Endereço incompleto." };
    }
    return checkHost(kind, parsed);
}

export function venueMapQuery(source: VenueLinkSource) {
    return [source.street, source.streetNumber, source.neighborhood, source.city, source.state]
        .map((part) => part?.trim() ?? "")
        .filter(Boolean)
        .join(", ");
}

export function venueMapLabel(source: VenueLinkSource) {
    return [source.neighborhood, source.city]
        .map((part) => part?.trim() ?? "")
        .filter(Boolean)
        .join(" — ");
}

export function publicVenuePlace(source: VenueLinkSource) {
    const mapQuery = venueMapQuery(source);
    const tour = filled(source.tourVideoUrl);
    return {
        mapLabel: mapQuery ? venueMapLabel(source) || null : null,
        mapQuery: mapQuery || null,
        tourVideoUrl: tour && isTourVideoUrl(tour) ? tour : null,
    };
}

export function linkTreePlace(rows: VenueLinkRow[], source: VenueLinkSource) {
    const place = publicVenuePlace(source);
    const tour = rows.find((row) => row.kind === "TOUR_VIDEO");
    const map = rows.find((row) => row.kind === "GOOGLE_MAPS");
    return {
        mapLabel: map && !map.visible ? null : place.mapLabel,
        mapQuery: map && !map.visible ? null : place.mapQuery,
        tourVideoUrl: tour && !tour.visible ? null : place.tourVideoUrl,
    };
}

export function defaultVenueLinks(source: VenueLinkSource): VenueLinkRow[] {
    const rows: Array<Omit<VenueLinkRow, "position">> = [
        { kind: "PRESENTATION", url: null, visible: true },
        { kind: "BUDGET_FORM", url: null, visible: true },
        { kind: "RULES", url: null, visible: true },
        { kind: "WHATSAPP", url: null, visible: Boolean(digits(source.whatsappNumber)) },
        { kind: "INSTAGRAM", url: filled(source.instagramUrl), visible: Boolean(filled(source.instagramUrl)) },
        { kind: "FACEBOOK", url: filled(source.facebookUrl), visible: Boolean(filled(source.facebookUrl)) },
        { kind: "TIKTOK", url: filled(source.tiktokUrl), visible: Boolean(filled(source.tiktokUrl)) },
        { kind: "SITE", url: filled(source.url), visible: Boolean(filled(source.url)) },
        { kind: "EMAIL", url: null, visible: Boolean(filled(source.email)?.includes("@")) },
        { kind: "TOUR_VIDEO", url: null, visible: Boolean(filled(source.tourVideoUrl)) },
        { kind: "GOOGLE_MAPS", url: null, visible: Boolean(venueMapQuery(source)) },
    ];
    const organizationUrl = filled(source.organizationUrl);
    if (organizationUrl) {
        rows.push({ kind: "ORGANIZATION_SITE", url: null, visible: true });
    }
    return rows.map((row, position) => ({ ...row, position }));
}

export function venueLinkColumns(rows: VenueLinkRow[]): VenueLinkColumns {
    const byKind = new Map(rows.map((row) => [row.kind, row]));
    const read = (kind: VenueLinkKind) => {
        const row = byKind.get(kind);
        if (!row) return null;
        const check = row.url ? checkVenueLinkUrl(kind, row.url) : null;
        return check?.status === "green" ? check.href : null;
    };
    return {
        url: read("SITE"),
        instagramUrl: read("INSTAGRAM"),
        facebookUrl: read("FACEBOOK"),
        tiktokUrl: read("TIKTOK"),
    };
}

const SHARE_PATH = {
    PRESENTATION: "apresentacao",
    BUDGET_FORM: "formulario",
    RULES: "regras",
} as const;

export function venueLinkHref(name: string, row: VenueLinkRow, source: VenueLinkSource, shareHost?: string | null): string | null {
    if (isPastedVenueLink(row.kind)) {
        if (!row.url) return null;
        const check = checkVenueLinkUrl(row.kind, row.url);
        return check.status === "green" ? check.href : null;
    }
    const key = encodeURIComponent(name);
    const sharePath = row.kind in SHARE_PATH ? SHARE_PATH[row.kind as keyof typeof SHARE_PATH] : null;
    if (sharePath && shareHost) return `https://${shareHost}/${sharePath}`;
    switch (row.kind) {
        case "PRESENTATION":
            return `${PUBLIC_HOST}/espaco/${key}/apresentacao`;
        case "BUDGET_FORM":
            return `${PUBLIC_HOST}/espaco/${key}/formulario`;
        case "RULES":
            return `${PUBLIC_HOST}/espaco/${key}/regras`;
        case "WHATSAPP": {
            const number = digits(source.whatsappNumber);
            return number ? `https://wa.me/${number}` : null;
        }
        case "EMAIL": {
            const email = filled(source.email);
            return email?.includes("@") ? `mailto:${email}` : null;
        }
        case "GOOGLE_MAPS": {
            const query = venueMapQuery(source);
            return query ? `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(query)}` : null;
        }
        case "TOUR_VIDEO":
            return filled(source.tourVideoUrl);
        case "ORGANIZATION_SITE":
            return absoluteHttp(source.organizationUrl);
        default:
            return null;
    }
}

export function publicVenueLinks(name: string, rows: VenueLinkRow[], source: VenueLinkSource, shareHost?: string | null) {
    return ordered(rows).flatMap((row) => {
        if (!row.visible) return [];
        const href = venueLinkHref(name, row, source, shareHost);
        if (!href) return [];
        return [{ kind: row.kind, label: VENUE_LINK_LABEL[row.kind], subtitle: VENUE_LINK_SUBTITLE[row.kind], href }];
    });
}

export type ResolvedVenueLink = {
    kind: VenueLinkKind;
    label: string;
    href: string;
};

export function resolvedPublicVenueLinks(name: string, rows: VenueLinkRow[], source: VenueLinkSource): ResolvedVenueLink[] {
    return publicVenueLinks(name, rows, source).map(({ kind, label, href }) => ({ kind, label, href }));
}

const LEGACY_KINDS = ["SITE", "INSTAGRAM", "FACEBOOK", "TIKTOK"] as const;

const LEGACY_COLUMN: Record<(typeof LEGACY_KINDS)[number], keyof VenueLinkSource> = {
    SITE: "url",
    INSTAGRAM: "instagramUrl",
    FACEBOOK: "facebookUrl",
    TIKTOK: "tiktokUrl",
};

export function ensureLegacyVenueLinks(rows: VenueLinkRow[], source: VenueLinkSource): VenueLinkRow[] {
    const existing = new Set(rows.map((row) => row.kind));
    const extra: VenueLinkRow[] = [];
    let position = rows.reduce((max, row) => Math.max(max, row.position), -1) + 1;
    for (const kind of LEGACY_KINDS) {
        if (existing.has(kind)) continue;
        const raw = source[LEGACY_COLUMN[kind]];
        if (typeof raw !== "string" || !raw.trim()) continue;
        const check = checkVenueLinkUrl(kind, raw);
        if (check.status !== "green" || !check.href) continue;
        extra.push({ kind, url: check.href, visible: true, position });
        position += 1;
    }
    return extra.length === 0 ? rows : [...rows, ...extra];
}

export function omitLegacyVenueLinkColumns<T extends object>(data: T): T {
    const next = { ...data } as T & Record<string, unknown>;
    for (const key of Object.values(LEGACY_COLUMN)) delete next[key];
    return next;
}

export function syncContactVenueLinks(
    rows: VenueLinkRow[],
    fields: { whatsappNumber?: string | null; tourVideoUrl?: string | null },
): { insert: VenueLinkRow[]; remove: VenueLinkKind[] } {
    const byKind = new Map(rows.map((row) => [row.kind, row]));
    const insert: VenueLinkRow[] = [];
    const remove: VenueLinkKind[] = [];
    let position = rows.reduce((max, row) => Math.max(max, row.position), -1) + 1;

    if (fields.whatsappNumber !== undefined) {
        const number = digits(fields.whatsappNumber);
        const row = byKind.get("WHATSAPP");
        if (number && !row) {
            insert.push({ kind: "WHATSAPP", url: CREATED_VENUE_LINK_MARK, visible: false, position });
            position += 1;
        } else if (!number && row) {
            remove.push("WHATSAPP");
        }
    }

    if (fields.tourVideoUrl !== undefined) {
        const text = fields.tourVideoUrl?.trim() ?? "";
        const row = byKind.get("TOUR_VIDEO");
        if (text && isTourVideoUrl(text) && !row) {
            insert.push({ kind: "TOUR_VIDEO", url: CREATED_VENUE_LINK_MARK, visible: false, position });
        } else if (!text && row) {
            remove.push("TOUR_VIDEO");
        }
    }

    return { insert, remove };
}

export const CREATED_VENUE_LINK_MARK = "created";

export function isCreatedVenueLink(row: { kind: VenueLinkKind; url: string | null }) {
    if (isPastedVenueLink(row.kind)) {
        return Boolean(row.url?.trim()) && checkVenueLinkUrl(row.kind, row.url ?? "").status === "green";
    }
    return row.url === CREATED_VENUE_LINK_MARK;
}

export function createdVenueLinks<T extends { kind: VenueLinkKind; url: string | null }>(rows: T[]) {
    return rows.filter(isCreatedVenueLink);
}

export function createVenueLink(
    rows: VenueLinkRow[],
    kind: VenueLinkKind,
    url: string | null,
    name: string,
    source: VenueLinkSource,
    visible = true,
) {
    if (rows.some((row) => row.kind === kind)) return rows;
    if (isPastedVenueLink(kind)) {
        const check = checkVenueLinkUrl(kind, url ?? "");
        if (check.status !== "green" || !check.href) return rows;
        return [...rows, { kind, url: check.href, visible, position: rows.length }];
    }
    const draft: VenueLinkRow = { kind, url: CREATED_VENUE_LINK_MARK, visible: true, position: rows.length };
    const canShow = Boolean(venueLinkHref(name, draft, source));
    return [...rows, { ...draft, visible: canShow ? visible : false }];
}

export function replaceVenueLinkUrl<T extends VenueLinkRow>(rows: T[], kind: VenueLinkKind, url: string) {
    if (!isPastedVenueLink(kind) || !rows.some((row) => row.kind === kind)) return rows;
    const check = checkVenueLinkUrl(kind, url);
    if (check.status !== "green" || !check.href) return rows;
    return rows.map((row) => (row.kind === kind ? { ...row, url: check.href } : row));
}

export function editorVenueLinks(name: string, rows: VenueLinkRow[], source: VenueLinkSource) {
    return ordered(createdVenueLinks(rows)).map((row) => {
        const href = venueLinkHref(name, row, source);
        return {
            ...row,
            label: VENUE_LINK_LABEL[row.kind],
            hint: href ? null : venueLinkSourceHint(row.kind),
        };
    });
}

function ordered(rows: VenueLinkRow[]) {
    return rows
        .map((row, index) => ({ row, index }))
        .sort((left, right) => left.row.position - right.row.position || left.index - right.index)
        .map(({ row }, position) => ({ ...row, position }));
}

function filled(value?: string | null) {
    const text = value?.trim();
    return text ? text : null;
}

function digits(value?: string | null) {
    const text = (value ?? "").replace(/\D/g, "");
    return text || null;
}

function withScheme(value: string) {
    const text = value.trim();
    if (!text) return "";
    if (/^https?:\/\//i.test(text)) return text;
    return `https://${text.replace(/^\/+/, "")}`;
}

function absoluteHttp(value?: string | null) {
    const text = filled(value);
    if (!text) return null;
    return withScheme(text);
}

function parseHttp(href: string): URL | null {
    try {
        const url = new URL(href);
        if (url.protocol !== "http:" && url.protocol !== "https:") return null;
        return url;
    } catch {
        return null;
    }
}

function bareHost(url: URL) {
    return url.hostname.toLowerCase().replace(/^www\./, "");
}

function firstSegment(url: URL) {
    return url.pathname.split("/").filter(Boolean)[0] ?? "";
}

function checkHost(kind: VenueLinkKind, url: URL): VenueLinkCheck {
    const host = bareHost(url);
    const label = VENUE_LINK_LABEL[kind];
    const green = (message: string): VenueLinkCheck => ({ status: "green", href: url.toString(), message });
    const amber = (message: string): VenueLinkCheck => ({ status: "amber", href: null, message });
    const red = (message: string): VenueLinkCheck => ({ status: "red", href: null, message });

    switch (kind) {
        case "INSTAGRAM":
            if (host !== "instagram.com") return red("Esse link não é do Instagram. O endereço precisa ser instagram.com/…");
            if (["p", "reel", "reels", "stories", "explore", "tv", "direct"].includes(firstSegment(url).toLowerCase())) {
                return amber("Parece um post, não o perfil. Cole o link do perfil.");
            }
            return /^\/[A-Za-z0-9._]+\/?$/.test(url.pathname)
                ? green("Link do Instagram reconhecido.")
                : amber("Parece um post, não o perfil. Cole o link do perfil.");
        case "FACEBOOK":
            if (!["facebook.com", "m.facebook.com", "web.facebook.com", "fb.com"].includes(host)) {
                return red("Esse link não é do Facebook. O endereço precisa ser facebook.com/…");
            }
            if (url.pathname === "/profile.php" && /^\d+$/.test(url.searchParams.get("id") ?? "")) {
                return green("Link do Facebook reconhecido.");
            }
            if (/^\/[A-Za-z0-9.\-]+\/?$/.test(url.pathname) && !["sharer", "share", "dialog"].includes(firstSegment(url).toLowerCase())) {
                return green("Link do Facebook reconhecido.");
            }
            return amber("Esse link do Facebook não é uma página. Cole o link da página.");
        case "TIKTOK":
            if (host !== "tiktok.com") return red("Esse link não é do TikTok. O endereço precisa ser tiktok.com/@…");
            if (url.pathname.toLowerCase().includes("/video/")) return amber("Esse link é de um vídeo. Cole o link do perfil.");
            return /^\/@[A-Za-z0-9._]+\/?$/.test(url.pathname)
                ? green("Link do TikTok reconhecido.")
                : amber("Esse link é de um vídeo. Cole o link do perfil.");
        case "SITE":
            if (["instagram.com", "facebook.com", "m.facebook.com", "web.facebook.com", "fb.com", "tiktok.com"].includes(host)) {
                return red("Esse link é de uma rede. Escolha essa rede no seletor.");
            }
            return green("Link do site reconhecido.");
        case "YOUTUBE":
            if (host === "youtu.be" || (host === "youtube.com" && url.pathname === "/watch")) {
                return amber("Isso é um vídeo. O canal fica em youtube.com/@…. O vídeo do tour continua em Apresentação.");
            }
            if (host !== "youtube.com") return red("Esse link não é do YouTube. O endereço precisa ser youtube.com/@…");
            if (/^\/(@[^/]+|channel\/[^/]+|c\/[^/]+|user\/[^/]+)\/?$/.test(url.pathname)) {
                return green("Link do YouTube reconhecido.");
            }
            return amber("Isso é um vídeo. O canal fica em youtube.com/@…. O vídeo do tour continua em Apresentação.");
        case "GOOGLE_BUSINESS":
            if (host === "g.page" || host === "maps.app.goo.gl" || (host === "google.com" && url.pathname.startsWith("/maps"))) {
                return green("Link do Google Meu Negócio reconhecido.");
            }
            return red("Esse link não é do Google Meu Negócio.");
        case "PINTEREST":
            if (host === "pinterest.com" || host === "br.pinterest.com") return green("Link do Pinterest reconhecido.");
            return red("Esse link não é do Pinterest.");
        case "LINKEDIN":
            if (host === "linkedin.com" && /^\/(company|in)\/[^/]+\/?$/.test(url.pathname)) {
                return green("Link do LinkedIn reconhecido.");
            }
            return host === "linkedin.com"
                ? amber("Cole o link da empresa ou do perfil.")
                : red("Esse link não é do LinkedIn.");
        case "TRIPADVISOR":
            if (host === "tripadvisor.com" || host === "tripadvisor.com.br") return green("Link do TripAdvisor reconhecido.");
            return red("Esse link não é do TripAdvisor.");
        case "AIRBNB":
            if (host === "airbnb.com" || host === "airbnb.com.br") return green("Link do Airbnb reconhecido.");
            return red("Esse link não é do Airbnb.");
        case "MENU":
            return green(`Link de ${label} reconhecido.`);
        default:
            return red("Esse link não serve para essa rede.");
    }
}
