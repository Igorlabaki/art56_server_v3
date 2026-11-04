import { z } from "zod";

const YOUTUBE_ID = /^[A-Za-z0-9_-]{11}$/;
const VIDEO_FILE = /\.(mp4|webm|ogg|mov)$/i;

export const TOUR_VIDEO_URL_MESSAGE =
    "Use um link do YouTube ou um arquivo de video (mp4, webm, ogg ou mov).";

function youtubeId(url: URL): string | null {
    const host = url.hostname.toLowerCase();
    const parts = url.pathname.split("/").filter(Boolean);

    if (host === "youtu.be") {
        const id = parts[0];
        return parts.length === 1 && id && YOUTUBE_ID.test(id) ? id : null;
    }

    if (host !== "youtube.com" && host !== "www.youtube.com" && host !== "m.youtube.com") {
        return null;
    }

    if ((parts[0] === "shorts" || parts[0] === "embed") && parts.length === 2 && YOUTUBE_ID.test(parts[1])) {
        return parts[1];
    }

    if (url.pathname === "/watch") {
        const id = url.searchParams.get("v");
        return id && YOUTUBE_ID.test(id) ? id : null;
    }

    return null;
}

export function isTourVideoUrl(value: string): boolean {
    let url: URL;
    try {
        url = new URL(value);
    } catch {
        return false;
    }

    if (url.protocol !== "https:" || url.username || url.password) {
        return false;
    }

    if (youtubeId(url)) {
        return true;
    }

    return VIDEO_FILE.test(url.pathname);
}

export const tourVideoUrlSchema = z
    .union([
        z.literal("").transform(() => null),
        z.null(),
        z.string().refine(isTourVideoUrl, { message: TOUR_VIDEO_URL_MESSAGE }),
    ])
    .optional();
