import { VenueImageForReorder } from "../repositories/interface/proposal-repository-interface";

export type PlannedImageOrder =
    | { ok: true; changed: false; images: VenueImageForReorder[] }
    | { ok: true; changed: true; images: VenueImageForReorder[]; updates: { id: string; position: number }[] }
    | { ok: false };

export function sortImagePositionUpdates(updates: { id: string; position: number }[]) {
    return [...updates].sort((left, right) => left.id.localeCompare(right.id));
}

export function planVisibleImagePositions(
    visibleInCurrentOrder: VenueImageForReorder[],
    hiddenPositions: number[],
    imageIds: string[]
): PlannedImageOrder {
    if (new Set(imageIds).size !== imageIds.length) {
        return { ok: false };
    }

    const byId = new Map(visibleInCurrentOrder.map((image) => [image.id, image]));
    if (imageIds.length !== visibleInCurrentOrder.length || imageIds.some((id) => !byId.has(id))) {
        return { ok: false };
    }

    const currentIds = visibleInCurrentOrder.map((image) => image.id);
    if (imageIds.every((id, index) => id === currentIds[index])) {
        return { ok: true, changed: false, images: visibleInCurrentOrder };
    }

    const taken = new Set(hiddenPositions);
    const start = visibleInCurrentOrder.reduce(
        (min, image) => Math.min(min, image.position),
        visibleInCurrentOrder[0].position
    );
    const slots: number[] = [];
    let cursor = start;
    while (slots.length < imageIds.length) {
        if (!taken.has(cursor)) {
            slots.push(cursor);
        }
        cursor += 1;
    }

    const images = imageIds.map((id, index) => ({
        ...byId.get(id)!,
        position: slots[index],
    }));

    return {
        ok: true,
        changed: true,
        images,
        updates: images.map((image) => ({ id: image.id, position: image.position })),
    };
}
