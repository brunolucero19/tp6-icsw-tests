export interface User {
  id: string
  email: string
  password: string
  isEmailVerified: boolean
  emailVerificationToken?: string
  createdAt: Date
  updatedAt: Date
}

export interface Contact {
  id: string
  userId: string
  firstName: string
  lastName: string
  dateOfBirth?: Date
  email?: string
  phone?: string
  address1?: string
  address2?: string
  city?: string
  state?: string
  postalCode?: string
  country?: string
  createdAt: Date
  updatedAt: Date
}

export interface CreateUserRequest {
  email: string
  password: string
  confirmPassword: string
}

export interface LoginRequest {
  email: string
  password: string
}

export interface CreateContactRequest {
  firstName: string
  lastName: string
  dateOfBirth?: string
  email?: string
  phone?: string
  address1?: string
  address2?: string
  city?: string
  state?: string
  postalCode?: string
  country?: string
}

export interface UpdateContactRequest extends Partial<CreateContactRequest> {}

export interface AuthenticatedRequest {
  user?: {
    id: string
    email: string
  }
}
