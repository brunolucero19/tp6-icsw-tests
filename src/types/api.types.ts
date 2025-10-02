// Tipos para la API de contactos
export interface User {
  _id?: string
  firstName: string
  lastName: string
  email: string
  password?: string
}

export interface Contact {
  _id?: string
  firstName: string
  lastName: string
  birthdate?: string
  email?: string
  phone?: string
  street1?: string
  street2?: string
  city?: string
  stateProvince?: string
  postalCode?: string
  country?: string
  owner?: string
}

export interface AuthResponse {
  token: string
  user: User
}

export interface ApiResponse<T = any> {
  success: boolean
  data?: T
  message?: string
  error?: string
}

export interface LoginCredentials {
  email: string
  password: string
}

export interface RegisterData {
  firstName: string
  lastName: string
  email: string
  password: string
}
