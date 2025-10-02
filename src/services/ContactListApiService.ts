import {
  User,
  Contact,
  AuthResponse,
  LoginCredentials,
  RegisterData,
} from '../types/api.types'

export class ContactListApiService {
  private baseUrl: string
  private token: string | null = null

  constructor(
    baseUrl: string = 'https://thinking-tester-contact-list.herokuapp.com'
  ) {
    this.baseUrl = baseUrl
  }

  setToken(token: string): void {
    this.token = token
  }

  private getHeaders(): Record<string, string> {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    }

    if (this.token) {
      headers['Authorization'] = `Bearer ${this.token}`
    }

    return headers
  }

  async register(userData: RegisterData): Promise<AuthResponse> {
    const response = await fetch(`${this.baseUrl}/users`, {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify(userData),
    })

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      throw new Error(
        errorData.message || `HTTP ${response.status}: ${response.statusText}`
      )
    }

    const data = await response.json()

    // Guardar el token automáticamente después del registro exitoso
    if (data.token) {
      this.setToken(data.token)
    }

    return {
      token: data.token,
      user: data.user,
    }
  }

  async login(credentials: LoginCredentials): Promise<AuthResponse> {
    const response = await fetch(`${this.baseUrl}/users/login`, {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify(credentials),
    })

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      throw new Error(
        errorData.message || `HTTP ${response.status}: ${response.statusText}`
      )
    }

    const data = await response.json()

    // Guardar el token automáticamente después del login exitoso
    if (data.token) {
      this.setToken(data.token)
    }

    return {
      token: data.token,
      user: data.user,
    }
  }

  async logout(): Promise<void> {
    if (!this.token) {
      throw new Error('Authentication token is required')
    }

    const response = await fetch(`${this.baseUrl}/users/logout`, {
      method: 'POST',
      headers: this.getHeaders(),
    })

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      throw new Error(
        errorData.message || `HTTP ${response.status}: ${response.statusText}`
      )
    }

    // Limpiar el token después del logout exitoso
    this.token = null
  }

  async getUserProfile(): Promise<User> {
    if (!this.token) {
      throw new Error('Authentication token is required')
    }

    const response = await fetch(`${this.baseUrl}/users/me`, {
      method: 'GET',
      headers: this.getHeaders(),
    })

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      throw new Error(
        errorData.message || `HTTP ${response.status}: ${response.statusText}`
      )
    }

    return await response.json()
  }

  async updateUserProfile(userData: Partial<User>): Promise<User> {
    if (!this.token) {
      throw new Error('Authentication token is required')
    }

    const response = await fetch(`${this.baseUrl}/users/me`, {
      method: 'PATCH',
      headers: this.getHeaders(),
      body: JSON.stringify(userData),
    })

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      throw new Error(
        errorData.message || `HTTP ${response.status}: ${response.statusText}`
      )
    }

    return await response.json()
  }

  async deleteUser(): Promise<void> {
    if (!this.token) {
      throw new Error('Authentication token is required')
    }

    const response = await fetch(`${this.baseUrl}/users/me`, {
      method: 'DELETE',
      headers: this.getHeaders(),
    })

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      throw new Error(
        errorData.message || `HTTP ${response.status}: ${response.statusText}`
      )
    }

    // Limpiar el token después de eliminar el usuario
    this.token = null
  }

  async getContacts(): Promise<Contact[]> {
    if (!this.token) {
      throw new Error('Authentication token is required')
    }

    const response = await fetch(`${this.baseUrl}/contacts`, {
      method: 'GET',
      headers: this.getHeaders(),
    })

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      throw new Error(
        errorData.message || `HTTP ${response.status}: ${response.statusText}`
      )
    }

    return await response.json()
  }

  async createContact(
    contactData: Omit<Contact, '_id' | 'owner'>
  ): Promise<Contact> {
    if (!this.token) {
      throw new Error('Authentication token is required')
    }

    const response = await fetch(`${this.baseUrl}/contacts`, {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify(contactData),
    })

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      throw new Error(
        errorData.message || `HTTP ${response.status}: ${response.statusText}`
      )
    }

    return await response.json()
  }

  async getContact(contactId: string): Promise<Contact> {
    if (!this.token) {
      throw new Error('Authentication token is required')
    }

    const response = await fetch(`${this.baseUrl}/contacts/${contactId}`, {
      method: 'GET',
      headers: this.getHeaders(),
    })

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      throw new Error(
        errorData.message || `HTTP ${response.status}: ${response.statusText}`
      )
    }

    return await response.json()
  }

  async updateContact(
    contactId: string,
    contactData: Partial<Contact>
  ): Promise<Contact> {
    if (!this.token) {
      throw new Error('Authentication token is required')
    }

    const response = await fetch(`${this.baseUrl}/contacts/${contactId}`, {
      method: 'PUT',
      headers: this.getHeaders(),
      body: JSON.stringify(contactData),
    })

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      throw new Error(
        errorData.message || `HTTP ${response.status}: ${response.statusText}`
      )
    }

    return await response.json()
  }

  async updateContactPartial(
    contactId: string,
    contactData: Partial<Contact>
  ): Promise<Contact> {
    if (!this.token) {
      throw new Error('Authentication token is required')
    }

    const response = await fetch(`${this.baseUrl}/contacts/${contactId}`, {
      method: 'PATCH',
      headers: this.getHeaders(),
      body: JSON.stringify(contactData),
    })

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      throw new Error(
        errorData.message || `HTTP ${response.status}: ${response.statusText}`
      )
    }

    return await response.json()
  }

  async deleteContact(contactId: string): Promise<void> {
    if (!this.token) {
      throw new Error('Authentication token is required')
    }

    const response = await fetch(`${this.baseUrl}/contacts/${contactId}`, {
      method: 'DELETE',
      headers: this.getHeaders(),
    })

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      throw new Error(
        errorData.message || `HTTP ${response.status}: ${response.statusText}`
      )
    }

    // El método DELETE devuelve un mensaje de texto, no JSON
    // No necesitamos procesar la respuesta
  }
}
