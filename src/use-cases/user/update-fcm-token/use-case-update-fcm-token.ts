import { UserRepositoryInterface } from "../../../repositories/interface/user-repository-interface";
import { UpdateFcmTokenRequestParams } from "../../../zod/user/update-fcm-token-params-schema";
import { HttpResourceNotFoundError } from "../../../errors/errors-type/http-resource-not-found-error";

class UpdateFcmTokenUseCase {
    constructor(private userRepository: UserRepositoryInterface) { }

    async execute({userId, fcmToken }: UpdateFcmTokenRequestParams) {
        // Verificar se o usuário existe
        const user = await this.userRepository.getById(userId);

        if (!user) {
            throw new HttpResourceNotFoundError("Usuário");
        }

        // Atualizar o token FCM
        const updatedUser = await this.userRepository.updateFcmToken(userId, fcmToken);

        if (!updatedUser) {
            throw new Error("Erro ao atualizar o token FCM");
        }

        return updatedUser;
    }
}

export { UpdateFcmTokenUseCase }; 