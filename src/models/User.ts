import { User } from '../types'

class UserModel {
  private users: User[] = []

  async findByEmail(email: string): Promise<User | null> {
    const user = this.users.find((u) => u.email === email)
    return user || null
  }

  async findById(id: string): Promise<User | null> {
    const user = this.users.find((u) => u.id === id)
    return user || null
  }

  async create(
    userData: Omit<User, 'id' | 'createdAt' | 'updatedAt'>
  ): Promise<User> {
    const user: User = {
      id: this.generateId(),
      ...userData,
      createdAt: new Date(),
      updatedAt: new Date(),
    }

    this.users.push(user)
    return user
  }

  async update(id: string, updates: Partial<User>): Promise<User | null> {
    const userIndex = this.users.findIndex((u) => u.id === id)
    if (userIndex === -1) return null

    this.users[userIndex] = {
      ...this.users[userIndex],
      ...updates,
      updatedAt: new Date(),
    }

    return this.users[userIndex]
  }

  async verifyEmail(token: string): Promise<User | null> {
    const userIndex = this.users.findIndex(
      (u) => u.emailVerificationToken === token
    )
    if (userIndex === -1) return null

    this.users[userIndex] = {
      ...this.users[userIndex],
      isEmailVerified: true,
      emailVerificationToken: undefined,
      updatedAt: new Date(),
    }

    return this.users[userIndex]
  }

  private generateId(): string {
    return Date.now().toString() + Math.random().toString(36).substr(2, 9)
  }

  // Para testing - resetear datos
  async clear(): Promise<void> {
    this.users = []
  }

  // Para testing - obtener todos los usuarios
  async findAll(): Promise<User[]> {
    return [...this.users]
  }
}

export const userModel = new UserModel()
