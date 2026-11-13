export function readMultipartPayload(body: unknown) {
    if (body && typeof body === "object" && "payload" in body && typeof (body as { payload?: unknown }).payload === "string") {
        return JSON.parse((body as { payload: string }).payload);
    }
    return body;
}
