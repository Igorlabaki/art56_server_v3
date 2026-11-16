import { describe, expect, it, vi } from "vitest";
import { HttpBadRequestError } from "../../errors/errors-type/htttp-bad-request-error";
import { assertPhotoBelongsToVenue, VENUE_PHOTO_OTHER_VENUE_MESSAGE } from "../../functions/venue-photo-ref";
import { ensureAuthenticate } from "../../middleware/ensureAuthenticate";
import { imageRoutes } from "../../router/image";
import { CreateServiceUseCase } from "../service/create-service/use-case-create-service";
import { ServiceAuthorizer } from "../service/service-authorizer";

describe("photoId nos consumidores", () => {
    it("copia a URL quando a foto e do mesmo espaco e recusa a de outro", () => {
        expect(assertPhotoBelongsToVenue({ id: "p1", venueId: "venue-a", url: "https://cdn/a.webp" }, "venue-a").url)
            .toBe("https://cdn/a.webp");
        expect(() => assertPhotoBelongsToVenue({ id: "p2", venueId: "venue-b", url: "https://cdn/b.webp" }, "venue-a"))
            .toThrow(HttpBadRequestError);
        try {
            assertPhotoBelongsToVenue(null, "venue-a");
        } catch (error) {
            expect(error).toMatchObject({ statusCode: 400, message: VENUE_PHOTO_OTHER_VENUE_MESSAGE });
        }
    });

    it("grava o servico com a URL copiada da foto do mesmo espaco", async () => {
        const created: unknown[] = [];
        const useCase = new CreateServiceUseCase(
            {
                getByName: async () => null,
                create: async (params) => {
                    created.push(params);
                    return { id: "svc-1", ...params } as never;
                },
            } as never,
            new ServiceAuthorizer(
                { getById: async () => ({ organizationId: "org-1" }) as never },
                { getUserVenuePermission: async () => ({ permissions: "EDIT_VENUE_SERVICES" }) as never },
            ),
            { getById: async (id) => (id === "photo-a" ? { id, venueId: "venue-a", url: "https://cdn/piscina.webp" } : { id, venueId: "venue-b", url: "https://cdn/outra.webp" }) },
        );

        const response = await useCase.execute("user-1", {
            name: "DJ",
            price: 10,
            venueId: "venue-a",
            photoId: "photo-a",
            pricingType: "FIXED",
            description: null,
            imageUrl: null,
            rpaRequired: false,
        });
        expect(response.data.imageUrl).toBe("https://cdn/piscina.webp");
        expect(created[0]).toMatchObject({ photoId: "photo-a" });

        await expect(useCase.execute("user-1", {
            name: "Bar",
            price: 10,
            venueId: "venue-a",
            photoId: "photo-b",
            pricingType: "FIXED",
            description: null,
            imageUrl: null,
            rpaRequired: false,
        })).rejects.toMatchObject({ statusCode: 400 });
    });
});

describe("auth das escritas /image", () => {
    function layer(method: "post" | "put" | "delete" | "get", path: string) {
        return imageRoutes.stack.find((item) => item.route?.path === path && item.route.methods[method]);
    }

    it("exige token nas escritas do venue e deixa a leitura publica", () => {
        for (const route of [
            layer("post", "/upload"),
            layer("put", "/update"),
            layer("delete", "/delete/:imageId"),
        ]) {
            expect(route?.route?.stack.map((entry: { name: string }) => entry.name)).toContain("ensureAuthenticate");
        }
        expect(layer("get", "/list?:venueId?/:description?")?.route?.stack.map((entry: { name: string }) => entry.name))
            .not.toContain("ensureAuthenticate");
        expect(layer("get", "/getByTag?:venueId?/:tag?/:responsiveMode?")?.route?.stack.map((entry: { name: string }) => entry.name))
            .not.toContain("ensureAuthenticate");
        expect(layer("post", "/upload/image-organization")?.route?.stack.map((entry: { name: string }) => entry.name))
            .not.toContain("ensureAuthenticate");

        const status = vi.fn(() => ({ json: vi.fn() }));
        ensureAuthenticate({ headers: {} } as never, { status } as never, () => {
            throw new Error("nao deveria seguir");
        });
        expect(status).toHaveBeenCalledWith(401);
    });
});
