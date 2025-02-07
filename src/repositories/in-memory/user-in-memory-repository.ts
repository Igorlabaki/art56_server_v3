import { PrismaClient, User } from "@prisma/client"
import { UserRepositoryInterface } from "../interface/user-repository-interface"
import { RegisterUserRequestParams } from "../../zod/auth/register-user-params-schema"

export class MemoryUserRepository implements UserRepositoryInterface {
  public users: User[] = []

  constructor() { }

  async register(params: RegisterUserRequestParams): Promise<User> {
    const newUser: User = {
            id: `${this.users.length + 1}`, // Exemplo de id gerado de forma simples (geralmente, você usaria um UUID)
            email: params.email,
            username: params.username,
            password: params.password, // Assumindo que a senha vem de forma segura
        }

        this.users.push(newUser)
        return newUser
  }

  async getById(reference: string): Promise<User | null> {
    const user = this.users.find(user => user.id === reference)
    return Promise.resolve(user || null)
  }

  async getByEmail(reference: string): Promise<User | null> {
    const user = this.users.find(user => user.email === reference)
    return Promise.resolve(user || null)
  }

  async delete(reference: string): Promise<User | null> {
    const userIndex = this.users.findIndex(user => user.id === reference)

    if (userIndex === -1) return null

    const deletedUser = this.users.splice(userIndex, 1)[0]
    return Promise.resolve(deletedUser || null)
  }
}