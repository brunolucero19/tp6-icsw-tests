import bcrypt from 'bcrypt'
import jwt from 'jsonwebtoken'
import { v4 as uuidv4 } from 'uuid'

const SALT_ROUNDS = 12
const JWT_SECRET =
  process.env.JWT_SECRET || 'fallback_secret_change_in_production'

export class PasswordUtils {
  /**
   * Hashea una contraseña usando bcrypt
   */
  static async hashPassword(password: string): Promise<string> {
    return bcrypt.hash(password, SALT_ROUNDS)
  }

  /**
   * Compara una contraseña con su hash
   */
  static async comparePassword(
    password: string,
    hash: string
  ): Promise<boolean> {
    return bcrypt.compare(password, hash)
  }

  /**
   * Valida que la contraseña cumpla con los requerimientos
   * - Al menos 8 caracteres
   * - Al menos 1 letra
   * - Al menos 1 número
   * - Al menos 1 carácter especial
   */
  static validatePassword(password: string): {
    isValid: boolean
    errors: string[]
  } {
    const errors: string[] = []

    if (password.length < 8) {
      errors.push('La contraseña debe tener al menos 8 caracteres')
    }

    if (!/[a-zA-Z]/.test(password)) {
      errors.push('La contraseña debe contener al menos una letra')
    }

    if (!/\d/.test(password)) {
      errors.push('La contraseña debe contener al menos un número')
    }

    if (!/[^a-zA-Z0-9]/.test(password)) {
      errors.push('La contraseña debe contener al menos un carácter especial')
    }

    return {
      isValid: errors.length === 0,
      errors,
    }
  }
}

export class TokenUtils {
  /**
   * Genera un JWT token
   */
  static generateJWT(payload: object, expiresIn: string = '7d'): string {
    return jwt.sign(payload, JWT_SECRET, { expiresIn } as jwt.SignOptions)
  }

  /**
   * Verifica y decodifica un JWT token
   */
  static verifyJWT(token: string): any {
    return jwt.verify(token, JWT_SECRET)
  }

  /**
   * Genera un token único para verificación de email
   */
  static generateEmailVerificationToken(): string {
    return uuidv4()
  }
}

export class ValidationUtils {
  /**
   * Valida formato de email
   */
  static validateEmail(email: string): boolean {
    const emailRegex =
      /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/
    return emailRegex.test(email.trim())
  }

  /**
   * Sanitiza string removiendo caracteres peligrosos
   */
  static sanitizeString(input: string): string {
    return input.trim().replace(/<[^>]*>/g, '')
  }
}
