import { HttpBadRequestError } from "../../../errors/errors-type/htttp-bad-request-error";
import { HttpForbiddenError } from "../../../errors/errors-type/http-forbidden-error";
import { HttpResourceNotFoundError } from "../../../errors/errors-type/http-resource-not-found-error";
import { HttpTokenError } from "../../../errors/errors-type/http-token-error";
import {
    checkVenueLinkUrl,
    CREATED_VENUE_LINK_MARK,
    createdVenueLinks,
    createVenueLink,
    editorVenueLinks,
    ensureLegacyVenueLinks,
    isPastedVenueLink,
    linkTreePlace,
    publicVenueLinks,
    venueLinkHref,
    venueLinkSourceHint,
    VenueLinkKind,
    VenueLinkRow,
    VenueLinkSource,
} from "../../../functions/venue-link";
import { VenueInfoEditPermission, VenueLinkRecord, VenueLinkRepository } from "../../../repositories/interface/venue-link-repository-interface";
import { VenueSiteEditPermission } from "../../../repositories/interface/venue-site-edit-permission-interface";

const deny: VenueInfoEditPermission = { canEditVenueInfo: async () => false };
const denySite: VenueSiteEditPermission = { canEditVenueSite: async () => false };

function sourceOf(record: VenueLinkRecord): VenueLinkSource {
    return {
        url: record.url,
        instagramUrl: record.instagramUrl,
        facebookUrl: record.facebookUrl,
        tiktokUrl: record.tiktokUrl,
        whatsappNumber: record.whatsappNumber,
        email: record.email,
        tourVideoUrl: record.tourVideoUrl,
        street: record.street,
        streetNumber: record.streetNumber,
        neighborhood: record.neighborhood,
        city: record.city,
        state: record.state,
        organizationUrl: record.organizationUrl,
    };
}

function rowsOf(record: VenueLinkRecord) {
    return createdVenueLinks(record.links);
}

export function venueLinkRowError(name: string, rows: VenueLinkRow[], source: VenueLinkSource) {
    const seen = new Set<string>();
    for (const row of rows) {
        if (seen.has(row.kind)) return "Cada rede entra uma vez.";
        seen.add(row.kind);
        if (isPastedVenueLink(row.kind)) {
            const check = checkVenueLinkUrl(row.kind, row.url ?? "");
            if (check.status !== "green") return check.message;
        }
        if (row.visible && !venueLinkHref(name, row, source)) {
            return "Esse link não pode aparecer no link tree.";
        }
    }
    return null;
}

function normalize(rows: VenueLinkRow[]): VenueLinkRow[] {
    return rows.map((row) => {
        if (!isPastedVenueLink(row.kind)) return { ...row, url: CREATED_VENUE_LINK_MARK };
        const check = checkVenueLinkUrl(row.kind, row.url ?? "");
        return { ...row, url: check.href };
    });
}

function orderedRows(rows: VenueLinkRow[]) {
    return rows
        .map((row, index) => ({ row, index }))
        .sort((left, right) => left.row.position - right.row.position || left.index - right.index)
        .map(({ row }) => row);
}

function reorderShown(rows: VenueLinkRow[], shown: VenueLinkKind[], kinds: VenueLinkKind[]) {
    const sameSet = new Set(kinds).size === kinds.length
        && kinds.length === shown.length
        && kinds.every((kind) => shown.includes(kind));
    if (!sameSet) return null;
    if (kinds.every((kind, index) => kind === shown[index])) return rows;
    const full = orderedRows(rows);
    const shownSet = new Set(shown);
    const slots = full.flatMap((row, index) => (shownSet.has(row.kind) ? [index] : []));
    const byKind = new Map(full.map((row) => [row.kind, row]));
    const next = full.slice();
    kinds.forEach((kind, index) => {
        next[slots[index]] = byKind.get(kind)!;
    });
    return next.map((row, position) => ({ ...row, position }));
}

function hideShown(rows: VenueLinkRow[], shown: VenueLinkKind[], kind: VenueLinkKind) {
    const row = rows.find((item) => item.kind === kind);
    if (!row || (row.visible && !shown.includes(kind))) return null;
    if (!shown.includes(kind)) return rows;
    return rows.map((item) => (item.kind === kind ? { ...item, visible: false } : item));
}

async function withLegacy(links: VenueLinkRepository, record: VenueLinkRecord) {
    const next = ensureLegacyVenueLinks(record.links, sourceOf(record));
    if (next === record.links) return record;
    const known = new Set(record.links.map((row) => row.kind));
    await links.insertMissing(record.id, next.filter((row) => !known.has(row.kind)));
    return { ...record, links: next };
}

function publicData(record: VenueLinkRecord, rows = rowsOf(record)) {
    const source = sourceOf(record);
    return {
        name: record.name,
        logoUrl: record.logoUrl,
        slogan: record.slogan,
        proposalPrimaryColor: record.proposalPrimaryColor,
        proposalSecondaryColor: record.proposalSecondaryColor,
        proposalTextColor: record.proposalTextColor,
        ...linkTreePlace(rows, source),
        links: publicVenueLinks(record.name, rows, source),
    };
}

class GetVenueLinksUseCase {
    constructor(
        private readonly links: VenueLinkRepository,
        private readonly permission: VenueSiteEditPermission = denySite,
    ) {}

    async execute(venueKey: string, userId: string | null = null) {
        const found = await this.links.findByKey(venueKey);
        if (!found) throw new HttpResourceNotFoundError("Espaco");
        const record = await withLegacy(this.links, found);
        const rows = rowsOf(record);
        const canReorder = userId
            ? await this.permission.canEditVenueSite(userId, record.id)
            : false;
        const data = {
            ...publicData(record, rows),
            canReorder,
            ...(canReorder ? { usedKinds: rows.map((row) => row.kind) } : {}),
        };
        return {
            success: true as const,
            message: "Links do espaco",
            data,
            count: data.links.length,
            type: "VenueLink",
        };
    }
}

class GetVenueLinkEditorUseCase {
    constructor(
        private readonly links: VenueLinkRepository,
        private readonly permission: VenueInfoEditPermission = deny,
    ) {}

    async execute(userId: string, venueKey: string) {
        const record = await this.links.findByKey(venueKey);
        if (!record) throw new HttpResourceNotFoundError("Espaco");
        if (!(await this.permission.canEditVenueInfo(userId, record.id))) {
            throw new HttpForbiddenError("Sem permissao para editar o espaco");
        }
        const ready = await withLegacy(this.links, record);
        const source = sourceOf(ready);
        const links = editorVenueLinks(ready.name, ready.links, source);
        return {
            success: true as const,
            message: "Links do espaco",
            data: { links },
            count: links.length,
            type: "VenueLink",
        };
    }
}

class SaveVenueLinksUseCase {
    constructor(
        private readonly links: VenueLinkRepository,
        private readonly permission: VenueInfoEditPermission = deny,
    ) {}

    async execute(userId: string, venueKey: string, rows: VenueLinkRow[]) {
        const record = await this.links.findByKey(venueKey);
        if (!record) throw new HttpResourceNotFoundError("Espaco");
        if (!(await this.permission.canEditVenueInfo(userId, record.id))) {
            throw new HttpForbiddenError("Sem permissao para editar o espaco");
        }
        const source = sourceOf(record);
        const error = venueLinkRowError(record.name, rows, source);
        if (error) throw new HttpBadRequestError(error);
        const normalized = normalize(rows);
        await this.links.replace(record.id, normalized);
        const saved = editorVenueLinks(record.name, normalized, source);
        return {
            success: true as const,
            message: "Links do espaco",
            data: { links: saved },
            count: saved.length,
            type: "VenueLink",
        };
    }
}

class OrderVenueLinksUseCase {
    constructor(
        private readonly links: VenueLinkRepository,
        private readonly permission: VenueSiteEditPermission = denySite,
    ) {}

    async execute(userId: string | null, venueKey: string, kinds: VenueLinkKind[]) {
        const loaded = await loadEditable(this.links, this.permission, userId, venueKey);
        const catalog = orderedRows(loaded.rows).map((row) => row.kind);
        const next = reorderShown(loaded.rows, catalog, kinds);
        if (!next) throw new HttpBadRequestError("A lista de links nao corresponde aos botoes da pagina.");
        return persistLayout(this.links, loaded, next);
    }
}

class CreateVenueLinkUseCase {
    constructor(
        private readonly links: VenueLinkRepository,
        private readonly permission: VenueSiteEditPermission = denySite,
    ) {}

    async execute(userId: string | null, venueKey: string, kind: VenueLinkKind, url: string | null, visible = true) {
        const loaded = await loadEditable(this.links, this.permission, userId, venueKey);
        if (loaded.rows.some((row) => row.kind === kind)) {
            throw new HttpBadRequestError("Essa rede ja existe.");
        }
        if (isPastedVenueLink(kind)) {
            const check = checkVenueLinkUrl(kind, url ?? "");
            if (check.status !== "green" || !check.href) throw new HttpBadRequestError(check.message);
        } else if (!venueLinkHref(loaded.record.name, { kind, url: CREATED_VENUE_LINK_MARK, visible: true, position: loaded.rows.length }, loaded.source)) {
            throw new HttpBadRequestError(venueLinkSourceHint(kind) ?? "Esse link ainda nao tem destino.");
        }
        const next = createVenueLink(loaded.rows, kind, url, loaded.record.name, loaded.source, visible);
        if (next === loaded.rows) throw new HttpBadRequestError("Essa rede ja existe.");
        await this.links.replace(loaded.record.id, next);
        const data = {
            ...publicData(loaded.record, next),
            canReorder: true as const,
            usedKinds: next.map((row) => row.kind),
        };
        return {
            success: true as const,
            message: "Links do espaco",
            data,
            count: data.links.length,
            type: "VenueLink",
        };
    }
}

class HideVenueLinkUseCase {
    constructor(
        private readonly links: VenueLinkRepository,
        private readonly permission: VenueSiteEditPermission = denySite,
    ) {}

    async execute(userId: string | null, venueKey: string, kind: VenueLinkKind) {
        const loaded = await loadEditable(this.links, this.permission, userId, venueKey);
        const shown = publicVenueLinks(loaded.record.name, loaded.rows, loaded.source).map((link) => link.kind);
        const next = hideShown(loaded.rows, shown, kind);
        if (!next) throw new HttpBadRequestError("Esse link nao aparece na pagina.");
        return persistLayout(this.links, loaded, next);
    }
}

async function loadEditable(
    links: VenueLinkRepository,
    permission: VenueSiteEditPermission,
    userId: string | null,
    venueKey: string,
) {
    if (!userId) throw new HttpTokenError();
    const record = await links.findByKey(venueKey);
    if (!record) throw new HttpResourceNotFoundError("Espaco");
    if (!(await permission.canEditVenueSite(userId, record.id))) {
        throw new HttpForbiddenError("Sem permissao para editar o site deste espaco");
    }
    const source = sourceOf(record);
    return { record, source, rows: rowsOf(record) };
}

async function persistLayout(
    links: VenueLinkRepository,
    loaded: { record: VenueLinkRecord; rows: VenueLinkRow[] },
    next: VenueLinkRow[],
) {
        if (next !== loaded.rows) {
        await links.replace(loaded.record.id, next);
    }
    const data = { ...publicData(loaded.record, next), canReorder: true as const };
    return {
        success: true as const,
        message: "Links do espaco",
        data,
        count: data.links.length,
        type: "VenueLink",
    };
}

class SetVenueLinkVisibleUseCase {
    constructor(
        private readonly links: VenueLinkRepository,
        private readonly permission: VenueSiteEditPermission = denySite,
    ) {}

    async execute(userId: string | null, venueKey: string, kind: VenueLinkKind, visible: boolean) {
        const loaded = await loadEditable(this.links, this.permission, userId, venueKey);
        const row = loaded.rows.find((item) => item.kind === kind);
        if (!row) throw new HttpBadRequestError("Essa rede ainda nao existe.");
        if (row.visible === visible) return persistLayout(this.links, loaded, loaded.rows);
        if (visible && !venueLinkHref(loaded.record.name, { ...row, visible: true }, loaded.source)) {
            throw new HttpBadRequestError("Esse link não pode aparecer no link tree.");
        }
        const next = loaded.rows.map((item) => (item.kind === kind ? { ...item, visible } : item));
        return persistLayout(this.links, loaded, next);
    }
}

export { CreateVenueLinkUseCase, GetVenueLinkEditorUseCase, GetVenueLinksUseCase, HideVenueLinkUseCase, OrderVenueLinksUseCase, SaveVenueLinksUseCase, SetVenueLinkVisibleUseCase };
