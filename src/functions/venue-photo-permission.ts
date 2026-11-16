export function grantPhotoPermission(current: string | null | undefined, source: string, granted: string) {
    const items = (current ?? "")
        .split(",")
        .map((item) => item.trim())
        .filter(Boolean);
    if (!items.includes(source) || items.includes(granted)) {
        return items.join(",");
    }
    return [...items, granted].join(",");
}
