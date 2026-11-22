export function logDomainEvent(message: string, fields: { hostname?: string; venueId?: string } = {}) {
    const line = {
        timestamp: new Date().toISOString(),
        level: "info",
        message,
        "service.name": "eventhub-api",
        "deployment.environment": process.env.NODE_ENV || "development",
        hostname: fields.hostname ?? "",
        venueId: fields.venueId ?? "",
    };
    console.info(JSON.stringify(line));
}
