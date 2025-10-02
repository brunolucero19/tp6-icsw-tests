// Utilidades para validación de datos

export class ValidationUtils {
  /**
   * Valida si un email tiene formato válido
   */
  static isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    return emailRegex.test(email)
  }

  /**
   * Valida si una contraseña cumple los requisitos mínimos
   */
  static isValidPassword(password: string): boolean {
    // Mínimo 7 caracteres
    return password.length >= 7
  }

  /**
   * Valida si un nombre tiene formato válido
   */
  static isValidName(name: string): boolean {
    return name.trim().length > 0 && name.trim().length <= 50
  }

  /**
   * Valida si un teléfono tiene formato válido
   */
  static isValidPhone(phone: string): boolean {
    // Acepta números, espacios, guiones, paréntesis y el símbolo +
    const phoneRegex = /^[\+\d\s\-\(\)]+$/
    const cleanPhone = phone.replace(/[\s\-\(\)\+]/g, '')
    return (
      phoneRegex.test(phone) &&
      cleanPhone.length >= 7 &&
      cleanPhone.length <= 15
    )
  }

  /**
   * Valida si una fecha de nacimiento es válida
   */
  static isValidBirthdate(birthdate: string): boolean {
    const date = new Date(birthdate)
    const now = new Date()
    const hundredYearsAgo = new Date(
      now.getFullYear() - 100,
      now.getMonth(),
      now.getDate()
    )

    return (
      date instanceof Date &&
      !isNaN(date.getTime()) &&
      date <= now &&
      date >= hundredYearsAgo
    )
  }

  /**
   * Sanitiza un string removiendo caracteres peligrosos
   */
  static sanitizeString(input: string): string {
    return input.trim().replace(/[<>'"&]/g, '')
  }
}
