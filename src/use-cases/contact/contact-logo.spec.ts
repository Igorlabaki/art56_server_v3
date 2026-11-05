import { beforeEach, describe, expect, it, vi } from "vitest";

const uploadContactLogo = vi.hoisted(() => vi.fn());
const deleteContactLogo = vi.hoisted(() => vi.fn());

vi.mock("../../functions/contact-logo-storage", () => ({
    uploadContactLogo,
    deleteContactLogo,
}));

import { CreateContactController } from "./create-contact/controller-create-contact";
import { CreateContactUseCase } from "./create-contact/use-case-create-contact";
import { UpdateContactController } from "./update-contact/controller-update-contact";
import { UpdateContactUseCase } from "./update-contact/use-case-update-contact";

const supplier = {
    name: "Casa Doce",
    role: "Buffet",
    venueId: "venue-1",
    whatsapp: "11999999999",
    type: "SUPPLIER",
    category: "OUTROS",
};

function responseDouble() {
    return {
        statusCode: 200,
        payload: undefined as { message?: string } | undefined,
        status(code: number) {
            this.statusCode = code;
            return this;
        },
        json(body: { message?: string }) {
            this.payload = body;
            return this;
        },
    };
}

function file(mimetype = "image/jpeg") {
    return { buffer: Buffer.from("img"), size: 12, mimetype };
}

class FakeCreate {
    params: unknown;
    async execute(params: unknown) {
        this.params = params;
        return { success: true, data: params };
    }
}

class FakeUpdate {
    params: unknown;
    contact: { id: string; type: "SUPPLIER" | "TEAM_MEMBER"; logoUrl: string | null } = {
        id: "contact-1",
        type: "SUPPLIER",
        logoUrl: "https://logo-test-bucket.s3.sa-east-1.amazonaws.com/contact-logo/old.webp",
    };
    async load() {
        return this.contact;
    }
    async execute(params: unknown) {
        this.params = params;
        return { success: true, data: params };
    }
}

beforeEach(() => {
    uploadContactLogo.mockReset();
    deleteContactLogo.mockReset();
    uploadContactLogo.mockResolvedValue("https://logo-test-bucket.s3.sa-east-1.amazonaws.com/contact-logo/nova.webp");
});

describe("controllers de logo do contato", () => {
    it("json sem arquivo cria o fornecedor e nao sobe logo", async () => {
        const useCase = new FakeCreate();
        const controller = new CreateContactController(useCase as unknown as CreateContactUseCase);
        const response = responseDouble();
        await controller.handle({ body: supplier } as never, response as never);
        expect(response.statusCode).toBe(201);
        expect(uploadContactLogo).not.toHaveBeenCalled();
        expect(useCase.params).toMatchObject({ name: "Casa Doce" });
        expect(useCase.params).not.toHaveProperty("logoUrl");
    });

    it("arquivo de fornecedor grava a url e payload multipart vale", async () => {
        const useCase = new FakeCreate();
        const controller = new CreateContactController(useCase as unknown as CreateContactUseCase);
        const response = responseDouble();
        await controller.handle({
            body: { payload: JSON.stringify({ ...supplier, description: "  Bolos  " }) },
            file: file(),
        } as never, response as never);
        expect(uploadContactLogo).toHaveBeenCalledOnce();
        expect(useCase.params).toMatchObject({
            description: "Bolos",
            logoUrl: "https://logo-test-bucket.s3.sa-east-1.amazonaws.com/contact-logo/nova.webp",
        });
    });

    it("criar equipe com arquivo falha e nao sobe", async () => {
        const useCase = new FakeCreate();
        const controller = new CreateContactController(useCase as unknown as CreateContactUseCase);
        const response = responseDouble();
        await controller.handle({
            body: { ...supplier, type: "TEAM_MEMBER", category: undefined },
            file: file(),
        } as never, response as never);
        expect(response.statusCode).toBe(400);
        expect(uploadContactLogo).not.toHaveBeenCalled();
        expect(useCase.params).toBeUndefined();
    });

    it("svg e arquivo grande nao sobem", async () => {
        const useCase = new FakeCreate();
        const controller = new CreateContactController(useCase as unknown as CreateContactUseCase);
        const svg = responseDouble();
        await controller.handle({ body: supplier, file: file("image/svg+xml") } as never, svg as never);
        expect(svg.statusCode).toBe(400);
        const huge = responseDouble();
        await controller.handle({
            body: supplier,
            file: { buffer: Buffer.from("x"), size: 5 * 1024 * 1024 + 1, mimetype: "image/jpeg" },
        } as never, huge as never);
        expect(huge.statusCode).toBe(400);
        expect(uploadContactLogo).not.toHaveBeenCalled();
    });

    it("removeLogo zera a logo e apaga a anterior", async () => {
        const useCase = new FakeUpdate();
        const controller = new UpdateContactController(useCase as unknown as UpdateContactUseCase);
        const response = responseDouble();
        await controller.handle({
            body: { contactId: "contact-1", data: { name: "Casa", removeLogo: true } },
        } as never, response as never);
        expect(useCase.params).toMatchObject({ data: { logoUrl: null } });
        expect(deleteContactLogo).toHaveBeenCalledWith(useCase.contact.logoUrl);
        expect(uploadContactLogo).not.toHaveBeenCalled();
    });

    it("arquivo novo vence removeLogo", async () => {
        const useCase = new FakeUpdate();
        const controller = new UpdateContactController(useCase as unknown as UpdateContactUseCase);
        const response = responseDouble();
        await controller.handle({
            body: { contactId: "contact-1", data: { removeLogo: "true" } },
            file: file("image/png"),
        } as never, response as never);
        expect(uploadContactLogo).toHaveBeenCalledOnce();
        expect(useCase.params).toMatchObject({
            data: { logoUrl: "https://logo-test-bucket.s3.sa-east-1.amazonaws.com/contact-logo/nova.webp" },
        });
        expect(deleteContactLogo).toHaveBeenCalledWith(useCase.contact.logoUrl);
    });

    it("virar equipe apaga a logo e equipe com arquivo falha", async () => {
        const useCase = new FakeUpdate();
        const controller = new UpdateContactController(useCase as unknown as UpdateContactUseCase);
        const response = responseDouble();
        await controller.handle({
            body: { contactId: "contact-1", data: { type: "TEAM_MEMBER" } },
        } as never, response as never);
        expect(useCase.params).toMatchObject({ data: { logoUrl: null, description: null } });
        expect(deleteContactLogo).toHaveBeenCalledWith(useCase.contact.logoUrl);

        const blocked = new FakeUpdate();
        blocked.contact = { ...useCase.contact, type: "TEAM_MEMBER" };
        const denied = responseDouble();
        await new UpdateContactController(blocked as unknown as UpdateContactUseCase).handle({
            body: { contactId: "contact-1", data: { name: "Equipe" } },
            file: file(),
        } as never, denied as never);
        expect(denied.statusCode).toBe(400);
        expect(blocked.params).toBeUndefined();
    });
});
