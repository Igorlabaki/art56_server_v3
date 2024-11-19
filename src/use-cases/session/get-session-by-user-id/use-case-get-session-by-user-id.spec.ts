import { describe, it, expect, beforeEach } from "vitest";

import { Session } from "@prisma/client";
import { GetSessionByUserIdUseCase } from "./use-case-get-session-user-by-id";
import { HttpResourceNotFoundError } from "../../../errors/errors-type/http-resource-not-found-error";
import { InMemorySessionRepository } from "../../../repositories/in-memory/session-in-memory-repository";
import { CreateSessionRequestParams } from "../../../repositories/interface/session-repository-interface";

let createdSession: Session | null;
let stu : GetSessionByUserIdUseCase;
let sessionRepository: InMemorySessionRepository;

describe("Get User By ID Use Case", () => {
    beforeEach(async () => {
        sessionRepository = new InMemorySessionRepository();
        stu = new GetSessionByUserIdUseCase(sessionRepository);

        const inputSession : CreateSessionRequestParams = {
            userId: "1",
            refreshTokenId: "2",
        };

        createdSession = await sessionRepository.create(inputSession);
    });

    it("should be able to retrieve a session by user_id", async () => {

        // Act: busca o session pelo user_id
        const  { session }  = await stu.execute("1");

        // Assert: verifica se o usuário foi encontrado
        expect(session).toBeTruthy();
        expect(session.userId).toBe(createdSession?.userId);
        expect(session.refreshTokenId).toBe(createdSession?.refreshTokenId);
    });

    it("should not be able to retrieve a session by user_id and throw HttpResourceNotFoundError", async () => {
        await expect(stu.execute("non-existent-id")).rejects.toThrow(HttpResourceNotFoundError);
    })
});
