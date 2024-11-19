import { describe, it, expect, beforeEach } from "vitest";
import { MemoryUserRepository } from "../../../repositories/in-memory/user-in-memory-repository";
import { GetUserByIdUseCase } from "./use-case-get-user-by-id";
import { HttpResourceNotFoundError } from "../../../errors/errors-type/http-resource-not-found-error";

let createdUser: any;
let userRepository: MemoryUserRepository;
let getUserByIdUseCase: GetUserByIdUseCase;

describe("Get User By ID Use Case", () => {
    beforeEach(async () => {
        userRepository = new MemoryUserRepository();
        getUserByIdUseCase = new GetUserByIdUseCase(userRepository);

        const inputUser = {
            email: "test@test.com",
            password: "securePassword",
            username: "testUser",
        };

        createdUser = await userRepository.register(inputUser);
    });

    it("should be able to retrieve a user by ID", async () => {

        // Act: busca o usuário pelo ID
        const { user } = await getUserByIdUseCase.execute(createdUser.id);

        // Assert: verifica se o usuário foi encontrado
        expect(user).toBeTruthy();
        expect(user.id).toBe(createdUser.id);
        expect(user.email).toBe(createdUser.email);
        expect(user.username).toBe(createdUser.username);
    });

    it("should not be able to retrieve a user by ID and throw HttpResourceNotFoundError", async () => {
        await expect(getUserByIdUseCase.execute("non-existent-id")).rejects.toThrow(HttpResourceNotFoundError);
    })
});
