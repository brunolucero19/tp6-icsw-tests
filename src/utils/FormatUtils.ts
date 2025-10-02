// Utilidades para formateo de datos

export class FormatUtils {
  /**
   * Formatea un nombre completo combinando nombre y apellido
   */
  static formatFullName(firstName: string, lastName: string): string {
    const first = firstName?.trim() || ''
    const last = lastName?.trim() || ''
    return `${first} ${last}`.trim()
  }

  /**
   * Formatea un número de teléfono
   */
  static formatPhone(phone: string): string {
    const cleanPhone = phone.replace(/\D/g, '')

    if (cleanPhone.length === 10) {
      return `(${cleanPhone.slice(0, 3)}) ${cleanPhone.slice(
        3,
        6
      )}-${cleanPhone.slice(6)}`
    }

    return phone
  }

  /**
   * Formatea una dirección completa
   */
  static formatAddress(
    street1?: string,
    street2?: string,
    city?: string,
    stateProvince?: string,
    postalCode?: string,
    country?: string
  ): string {
    const parts = []

    if (street1) parts.push(street1.trim())
    if (street2) parts.push(street2.trim())
    if (city) parts.push(city.trim())
    if (stateProvince) parts.push(stateProvince.trim())
    if (postalCode) parts.push(postalCode.trim())
    if (country) parts.push(country.trim())

    return parts.join(', ')
  }

  /**
   * Formatea una fecha al formato ISO
   */
  static formatDateToISO(date: Date | string): string {
    if (typeof date === 'string') {
      date = new Date(date)
    }
    return date.toISOString().split('T')[0]
  }

  /**
   * Capitaliza la primera letra de cada palabra
   */
  static capitalizeWords(text: string): string {
    return text.replace(
      /\w\S*/g,
      (txt) => txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase()
    )
  }
}
