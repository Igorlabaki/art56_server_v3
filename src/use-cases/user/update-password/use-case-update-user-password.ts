import { HttpInvalidCredentialsError } from "../../../errors/errors-type/http-invalid-credentials-error";
import { HttpResourceNotFoundError } from "../../../errors/errors-type/http-resource-not-found-error";
import { UserRepositoryInterface } from "../../../repositories/interface/user-repository-interface";
import { UpdatePasswordRequestParams } from "../../../zod/auth/update-password-params-schema";
import { compare, hash } from "bcryptjs";

class UpdateUserPasswordCase {
    constructor(private userRepository: UserRepositoryInterface) { }

    async execute(params: UpdatePasswordRequestParams) {
        const user = await this.userRepository.getById(params.userId);

        if (!user) {
            throw new HttpResourceNotFoundError("Usuário não encontrado");
        }

        const passwordMatch = await compare(params.currentPassword, user.password);

        if (!passwordMatch) {
            throw new HttpInvalidCredentialsError("Senha atual inválida");
        }

        const hashedPassword = await hash(params.newPassword, 8);

        const updatedUser = await this.userRepository.updatePassword({
            userId: params.userId,
            password: hashedPassword
        });

        return {
            success: true,
            message: "Senha atualizada com sucesso",
            data: {
                user: updatedUser
            }
        };
    }
}

export { UpdateUserPasswordCase };