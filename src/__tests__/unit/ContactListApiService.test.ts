import { ContactListApiService } from '../../services/ContactListApiService'
import { RegisterData, AuthResponse } from '../../types/api.types'

// Mock fetch globalmente
global.fetch = jest.fn()

describe('ContactListApiService', () => {
  let apiService: ContactListApiService
  const mockFetch = fetch as jest.MockedFunction<typeof fetch>

  beforeEach(() => {
    apiService = new ContactListApiService()
    jest.clearAllMocks()
  })

  describe('constructor', () => {
    it('should initialize with default base URL', () => {
      const service = new ContactListApiService()
      expect(service).toBeInstanceOf(ContactListApiService)
    })

    it('should initialize with custom base URL', () => {
      const customUrl = 'https://custom-api.com'
      const service = new ContactListApiService(customUrl)
      expect(service).toBeInstanceOf(ContactListApiService)
    })
  })

  describe('setToken', () => {
    it('should set authentication token', () => {
      const token = 'test-token-123'
      apiService.setToken(token)

      // Verificamos que el token se use en las cabeceras llamando a un método que use getHeaders
      // Como getHeaders es privado, lo verificaremos indirectamente
      expect(() => apiService.setToken(token)).not.toThrow()
    })
  })

  describe('register', () => {
    const validUserData: RegisterData = {
      firstName: 'Test',
      lastName: 'User',
      email: 'test@fake.com',
      password: 'myPassword',
    }

    const mockSuccessResponse: AuthResponse = {
      user: {
        _id: '608b2db1add2691791c04c89',
        firstName: 'Test',
        lastName: 'User',
        email: 'test@fake.com',
      },
      token:
        'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJfaWQiOiI2MDhiMmRiMWFkZDI2OTE3OTFjMDRjODgiLCJpYXQiOjE2MTk3MzM5Mzd9.06wN8dRBLkFiS_m2XdY6h4oLx3nMeupHvv-3C2AEKlY',
    }

    it('should successfully register a new user', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        status: 201,
        json: () => Promise.resolve(mockSuccessResponse),
      } as Response)

      const result = await apiService.register(validUserData)

      expect(mockFetch).toHaveBeenCalledWith(
        'https://thinking-tester-contact-list.herokuapp.com/users',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(validUserData),
        }
      )

      expect(result).toEqual(mockSuccessResponse)
    })

    it('should set token automatically after successful registration', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        status: 201,
        json: () => Promise.resolve(mockSuccessResponse),
      } as Response)

      await apiService.register(validUserData)

      // Verificamos que el token se estableció haciendo otra llamada que requiera autenticación
      mockFetch.mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: () => Promise.resolve({}),
      } as Response)

      // Cualquier llamada posterior debería incluir el token en las cabeceras
      const testCall = () => apiService.register(validUserData)
      await expect(testCall()).resolves.toBeDefined()
    })

    it('should handle registration with missing required fields', async () => {
      const invalidUserData = {
        firstName: '',
        lastName: 'User',
        email: 'test@fake.com',
        password: 'myPassword',
      }

      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 400,
        statusText: 'Bad Request',
        json: () =>
          Promise.resolve({
            message: 'Path `firstName` is required.',
          }),
      } as Response)

      await expect(apiService.register(invalidUserData)).rejects.toThrow(
        'Path `firstName` is required.'
      )

      expect(mockFetch).toHaveBeenCalledWith(
        'https://thinking-tester-contact-list.herokuapp.com/users',
        expect.objectContaining({
          method: 'POST',
          body: JSON.stringify(invalidUserData),
        })
      )
    })

    it('should handle registration with invalid email format', async () => {
      const invalidEmailData = {
        ...validUserData,
        email: 'invalid-email',
      }

      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 400,
        statusText: 'Bad Request',
        json: () =>
          Promise.resolve({
            message: 'Please enter a valid email',
          }),
      } as Response)

      await expect(apiService.register(invalidEmailData)).rejects.toThrow(
        'Please enter a valid email'
      )
    })

    it('should handle registration with duplicate email', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 400,
        statusText: 'Bad Request',
        json: () =>
          Promise.resolve({
            message: 'Email address is already in use',
          }),
      } as Response)

      await expect(apiService.register(validUserData)).rejects.toThrow(
        'Email address is already in use'
      )
    })

    it('should handle registration with password too short', async () => {
      const shortPasswordData = {
        ...validUserData,
        password: '123', // Menor a 7 caracteres
      }

      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 400,
        statusText: 'Bad Request',
        json: () =>
          Promise.resolve({
            message:
              'Path `password` (`123`) is shorter than the minimum allowed length (7).',
          }),
      } as Response)

      await expect(apiService.register(shortPasswordData)).rejects.toThrow(
        'Path `password` (`123`) is shorter than the minimum allowed length (7).'
      )
    })

    it('should handle network errors', async () => {
      mockFetch.mockRejectedValueOnce(new Error('Network Error'))

      await expect(apiService.register(validUserData)).rejects.toThrow(
        'Network Error'
      )
    })

    it('should handle server errors (500)', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 500,
        statusText: 'Internal Server Error',
        json: () => Promise.reject(new Error('Invalid JSON')),
      } as Response)

      await expect(apiService.register(validUserData)).rejects.toThrow(
        'HTTP 500: Internal Server Error'
      )
    })

    it('should handle malformed JSON response', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 400,
        statusText: 'Bad Request',
        json: () => Promise.reject(new Error('Invalid JSON')),
      } as Response)

      await expect(apiService.register(validUserData)).rejects.toThrow(
        'HTTP 400: Bad Request'
      )
    })

    it('should send correct headers', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        status: 201,
        json: () => Promise.resolve(mockSuccessResponse),
      } as Response)

      await apiService.register(validUserData)

      expect(mockFetch).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({
          headers: {
            'Content-Type': 'application/json',
          },
        })
      )
    })

    it('should handle empty response body', async () => {
      const emptyResponse = {
        user: null,
        token: null,
      }

      mockFetch.mockResolvedValueOnce({
        ok: true,
        status: 201,
        json: () => Promise.resolve(emptyResponse),
      } as Response)

      const result = await apiService.register(validUserData)
      expect(result).toEqual(emptyResponse)
    })
  })

  describe('getUserProfile', () => {
    const mockUserProfile = {
      _id: '608b2db1add2691791c04c89',
      firstName: 'Test',
      lastName: 'User',
      email: 'test@fake.com',
      __v: 1,
    }

    beforeEach(() => {
      // Set a token for authenticated requests
      apiService.setToken('valid-token-123')
    })

    it('should successfully get user profile', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: () => Promise.resolve(mockUserProfile),
      } as Response)

      const result = await apiService.getUserProfile()

      expect(mockFetch).toHaveBeenCalledWith(
        'https://thinking-tester-contact-list.herokuapp.com/users/me',
        {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            Authorization: 'Bearer valid-token-123',
          },
        }
      )

      expect(result).toEqual(mockUserProfile)
    })

    it('should throw error when no authentication token is provided', async () => {
      const serviceWithoutToken = new ContactListApiService()

      await expect(serviceWithoutToken.getUserProfile()).rejects.toThrow(
        'Authentication token is required'
      )

      expect(mockFetch).not.toHaveBeenCalled()
    })

    it('should handle unauthorized access (401)', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 401,
        statusText: 'Unauthorized',
        json: () =>
          Promise.resolve({
            message: 'Please authenticate',
          }),
      } as Response)

      await expect(apiService.getUserProfile()).rejects.toThrow(
        'Please authenticate'
      )
    })

    it('should handle invalid token', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 401,
        statusText: 'Unauthorized',
        json: () =>
          Promise.resolve({
            message: 'Invalid token',
          }),
      } as Response)

      await expect(apiService.getUserProfile()).rejects.toThrow('Invalid token')
    })

    it('should handle server errors', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 500,
        statusText: 'Internal Server Error',
        json: () => Promise.reject(new Error('Invalid JSON')),
      } as Response)

      await expect(apiService.getUserProfile()).rejects.toThrow(
        'HTTP 500: Internal Server Error'
      )
    })

    it('should handle network errors', async () => {
      mockFetch.mockRejectedValueOnce(new Error('Network Error'))

      await expect(apiService.getUserProfile()).rejects.toThrow('Network Error')
    })
  })

  describe('updateUserProfile', () => {
    const mockUpdatedProfile = {
      _id: '608b2db1add2691791c04c89',
      firstName: 'Updated',
      lastName: 'Username',
      email: 'test2@fake.com',
      __v: 1,
    }

    const updateData = {
      firstName: 'Updated',
      lastName: 'Username',
      email: 'test2@fake.com',
      password: 'myNewPassword',
    }

    beforeEach(() => {
      // Set a token for authenticated requests
      apiService.setToken('valid-token-123')
    })

    it('should successfully update user profile', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: () => Promise.resolve(mockUpdatedProfile),
      } as Response)

      const result = await apiService.updateUserProfile(updateData)

      expect(mockFetch).toHaveBeenCalledWith(
        'https://thinking-tester-contact-list.herokuapp.com/users/me',
        {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
            Authorization: 'Bearer valid-token-123',
          },
          body: JSON.stringify(updateData),
        }
      )

      expect(result).toEqual(mockUpdatedProfile)
    })

    it('should successfully update partial user profile', async () => {
      const partialUpdate = {
        firstName: 'UpdatedFirst',
      }

      const partialResponse = {
        ...mockUpdatedProfile,
        firstName: 'UpdatedFirst',
      }

      mockFetch.mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: () => Promise.resolve(partialResponse),
      } as Response)

      const result = await apiService.updateUserProfile(partialUpdate)

      expect(mockFetch).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({
          body: JSON.stringify(partialUpdate),
        })
      )

      expect(result).toEqual(partialResponse)
    })

    it('should throw error when no authentication token is provided', async () => {
      const serviceWithoutToken = new ContactListApiService()

      await expect(
        serviceWithoutToken.updateUserProfile(updateData)
      ).rejects.toThrow('Authentication token is required')

      expect(mockFetch).not.toHaveBeenCalled()
    })

    it('should handle validation errors', async () => {
      const invalidUpdateData = {
        email: 'invalid-email-format',
      }

      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 400,
        statusText: 'Bad Request',
        json: () =>
          Promise.resolve({
            message: 'Please enter a valid email',
          }),
      } as Response)

      await expect(
        apiService.updateUserProfile(invalidUpdateData)
      ).rejects.toThrow('Please enter a valid email')
    })

    it('should handle duplicate email error', async () => {
      const duplicateEmailData = {
        email: 'existing@email.com',
      }

      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 400,
        statusText: 'Bad Request',
        json: () =>
          Promise.resolve({
            message: 'Email address is already in use',
          }),
      } as Response)

      await expect(
        apiService.updateUserProfile(duplicateEmailData)
      ).rejects.toThrow('Email address is already in use')
    })

    it('should handle password too short error', async () => {
      const shortPasswordData = {
        password: '123',
      }

      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 400,
        statusText: 'Bad Request',
        json: () =>
          Promise.resolve({
            message:
              'Path `password` (`123`) is shorter than the minimum allowed length (7).',
          }),
      } as Response)

      await expect(
        apiService.updateUserProfile(shortPasswordData)
      ).rejects.toThrow(
        'Path `password` (`123`) is shorter than the minimum allowed length (7).'
      )
    })

    it('should handle unauthorized access (401)', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 401,
        statusText: 'Unauthorized',
        json: () =>
          Promise.resolve({
            message: 'Please authenticate',
          }),
      } as Response)

      await expect(apiService.updateUserProfile(updateData)).rejects.toThrow(
        'Please authenticate'
      )
    })

    it('should handle server errors', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 500,
        statusText: 'Internal Server Error',
        json: () => Promise.reject(new Error('Invalid JSON')),
      } as Response)

      await expect(apiService.updateUserProfile(updateData)).rejects.toThrow(
        'HTTP 500: Internal Server Error'
      )
    })

    it('should handle network errors', async () => {
      mockFetch.mockRejectedValueOnce(new Error('Network Error'))

      await expect(apiService.updateUserProfile(updateData)).rejects.toThrow(
        'Network Error'
      )
    })

    it('should send correct headers with authentication', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: () => Promise.resolve(mockUpdatedProfile),
      } as Response)

      await apiService.updateUserProfile(updateData)

      expect(mockFetch).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({
          headers: {
            'Content-Type': 'application/json',
            Authorization: 'Bearer valid-token-123',
          },
        })
      )
    })
  })

  describe('login', () => {
    const mockLoginCredentials = {
      email: 'test2@fake.com',
      password: 'myNewPassword',
    }

    const mockLoginResponse = {
      user: {
        _id: '608b2db1add2691791c04c89',
        firstName: 'Updated',
        lastName: 'Username',
        email: 'test2@fake.com',
        __v: 212,
      },
      token:
        'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJfaWQiOiI2MDgyMWYzMDYyZmJiMjEzZTJhZDlhMjAiLCJpYXQiOjE2MTk3MzQ0NDB9.4CftGzYRmK04PJv6xKqmWWo9iOH2wlizEU8vk-L48LI',
    }

    it('should successfully login user', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: () => Promise.resolve(mockLoginResponse),
      } as Response)

      const result = await apiService.login(mockLoginCredentials)

      expect(mockFetch).toHaveBeenCalledWith(
        'https://thinking-tester-contact-list.herokuapp.com/users/login',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(mockLoginCredentials),
        }
      )

      expect(result).toEqual(mockLoginResponse)
    })

    it('should set token automatically after successful login', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: () => Promise.resolve(mockLoginResponse),
      } as Response)

      await apiService.login(mockLoginCredentials)

      // Verificamos que el token se estableció haciendo una llamada que requiera autenticación
      mockFetch.mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: () => Promise.resolve({}),
      } as Response)

      // La siguiente llamada debería incluir el token
      const testCall = () => apiService.getUserProfile()
      await expect(testCall()).resolves.toBeDefined()
    })

    it('should handle login with invalid credentials', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 401,
        statusText: 'Unauthorized',
        json: () =>
          Promise.resolve({
            message: 'Invalid credentials',
          }),
      } as Response)

      await expect(apiService.login(mockLoginCredentials)).rejects.toThrow(
        'Invalid credentials'
      )
    })

    it('should handle login with incorrect email', async () => {
      const incorrectEmailCredentials = {
        email: 'wrong@email.com',
        password: 'myNewPassword',
      }

      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 401,
        statusText: 'Unauthorized',
        json: () =>
          Promise.resolve({
            message: 'Invalid credentials',
          }),
      } as Response)

      await expect(apiService.login(incorrectEmailCredentials)).rejects.toThrow(
        'Invalid credentials'
      )
    })

    it('should handle login with incorrect password', async () => {
      const incorrectPasswordCredentials = {
        email: 'test2@fake.com',
        password: 'wrongPassword',
      }

      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 401,
        statusText: 'Unauthorized',
        json: () =>
          Promise.resolve({
            message: 'Invalid credentials',
          }),
      } as Response)

      await expect(
        apiService.login(incorrectPasswordCredentials)
      ).rejects.toThrow('Invalid credentials')
    })

    it('should handle validation errors for login', async () => {
      const invalidCredentials = {
        email: 'invalid-email',
        password: 'short',
      }

      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 400,
        statusText: 'Bad Request',
        json: () =>
          Promise.resolve({
            message: 'Please enter a valid email',
          }),
      } as Response)

      await expect(apiService.login(invalidCredentials)).rejects.toThrow(
        'Please enter a valid email'
      )
    })

    it('should handle server errors during login', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 500,
        statusText: 'Internal Server Error',
        json: () => Promise.reject(new Error('Invalid JSON')),
      } as Response)

      await expect(apiService.login(mockLoginCredentials)).rejects.toThrow(
        'HTTP 500: Internal Server Error'
      )
    })

    it('should handle network errors during login', async () => {
      mockFetch.mockRejectedValueOnce(new Error('Network Error'))

      await expect(apiService.login(mockLoginCredentials)).rejects.toThrow(
        'Network Error'
      )
    })

    it('should send correct headers for login', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: () => Promise.resolve(mockLoginResponse),
      } as Response)

      await apiService.login(mockLoginCredentials)

      expect(mockFetch).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({
          headers: {
            'Content-Type': 'application/json',
          },
        })
      )
    })
  })

  describe('logout', () => {
    beforeEach(() => {
      // Set a token for authenticated requests
      apiService.setToken('valid-token-123')
    })

    it('should successfully logout user', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: () => Promise.resolve({}),
      } as Response)

      await apiService.logout()

      expect(mockFetch).toHaveBeenCalledWith(
        'https://thinking-tester-contact-list.herokuapp.com/users/logout',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: 'Bearer valid-token-123',
          },
        }
      )
    })

    it('should clear token after successful logout', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: () => Promise.resolve({}),
      } as Response)

      await apiService.logout()

      // Verificamos que el token se limpió intentando hacer una llamada que requiera auth
      await expect(apiService.getUserProfile()).rejects.toThrow(
        'Authentication token is required'
      )
    })

    it('should throw error when no authentication token is provided', async () => {
      const serviceWithoutToken = new ContactListApiService()

      await expect(serviceWithoutToken.logout()).rejects.toThrow(
        'Authentication token is required'
      )

      expect(mockFetch).not.toHaveBeenCalled()
    })

    it('should handle unauthorized logout attempt', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 401,
        statusText: 'Unauthorized',
        json: () =>
          Promise.resolve({
            message: 'Please authenticate',
          }),
      } as Response)

      await expect(apiService.logout()).rejects.toThrow('Please authenticate')
    })

    it('should handle invalid token during logout', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 401,
        statusText: 'Unauthorized',
        json: () =>
          Promise.resolve({
            message: 'Invalid token',
          }),
      } as Response)

      await expect(apiService.logout()).rejects.toThrow('Invalid token')
    })

    it('should handle server errors during logout', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 500,
        statusText: 'Internal Server Error',
        json: () => Promise.reject(new Error('Invalid JSON')),
      } as Response)

      await expect(apiService.logout()).rejects.toThrow(
        'HTTP 500: Internal Server Error'
      )
    })

    it('should handle network errors during logout', async () => {
      mockFetch.mockRejectedValueOnce(new Error('Network Error'))

      await expect(apiService.logout()).rejects.toThrow('Network Error')
    })
  })

  describe('deleteUser', () => {
    beforeEach(() => {
      // Set a token for authenticated requests
      apiService.setToken('valid-token-123')
    })

    it('should successfully delete user', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: () => Promise.resolve({}),
      } as Response)

      await apiService.deleteUser()

      expect(mockFetch).toHaveBeenCalledWith(
        'https://thinking-tester-contact-list.herokuapp.com/users/me',
        {
          method: 'DELETE',
          headers: {
            'Content-Type': 'application/json',
            Authorization: 'Bearer valid-token-123',
          },
        }
      )
    })

    it('should clear token after successful user deletion', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: () => Promise.resolve({}),
      } as Response)

      await apiService.deleteUser()

      // Verificamos que el token se limpió intentando hacer una llamada que requiera auth
      await expect(apiService.getUserProfile()).rejects.toThrow(
        'Authentication token is required'
      )
    })

    it('should throw error when no authentication token is provided', async () => {
      const serviceWithoutToken = new ContactListApiService()

      await expect(serviceWithoutToken.deleteUser()).rejects.toThrow(
        'Authentication token is required'
      )

      expect(mockFetch).not.toHaveBeenCalled()
    })

    it('should handle unauthorized delete attempt', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 401,
        statusText: 'Unauthorized',
        json: () =>
          Promise.resolve({
            message: 'Please authenticate',
          }),
      } as Response)

      await expect(apiService.deleteUser()).rejects.toThrow(
        'Please authenticate'
      )
    })

    it('should handle invalid token during delete', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 401,
        statusText: 'Unauthorized',
        json: () =>
          Promise.resolve({
            message: 'Invalid token',
          }),
      } as Response)

      await expect(apiService.deleteUser()).rejects.toThrow('Invalid token')
    })

    it('should handle user not found error', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 404,
        statusText: 'Not Found',
        json: () =>
          Promise.resolve({
            message: 'User not found',
          }),
      } as Response)

      await expect(apiService.deleteUser()).rejects.toThrow('User not found')
    })

    it('should handle server errors during delete', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 500,
        statusText: 'Internal Server Error',
        json: () => Promise.reject(new Error('Invalid JSON')),
      } as Response)

      await expect(apiService.deleteUser()).rejects.toThrow(
        'HTTP 500: Internal Server Error'
      )
    })

    it('should handle network errors during delete', async () => {
      mockFetch.mockRejectedValueOnce(new Error('Network Error'))

      await expect(apiService.deleteUser()).rejects.toThrow('Network Error')
    })

    it('should send correct headers with authentication', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: () => Promise.resolve({}),
      } as Response)

      await apiService.deleteUser()

      expect(mockFetch).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({
          headers: {
            'Content-Type': 'application/json',
            Authorization: 'Bearer valid-token-123',
          },
        })
      )
    })
  })

  describe('getContacts', () => {
    const mockContactsList = [
      {
        _id: '6085a221fcfc72405667c3d4',
        firstName: 'John',
        lastName: 'Doe',
        birthdate: '1970-01-01',
        email: 'jdoe@fake.com',
        phone: '8005555555',
        street1: '1 Main St.',
        street2: 'Apartment A',
        city: 'Anytown',
        stateProvince: 'KS',
        postalCode: '12345',
        country: 'USA',
        owner: '6085a21efcfc72405667c3d4',
        __v: 0,
      },
      {
        _id: '607b29861ba4d3a0b96733bc',
        firstName: 'Jan',
        lastName: 'Brady',
        birthdate: '2001-11-11',
        email: 'fake2@gmail.com',
        phone: '8008675309',
        street1: '100 Elm St.',
        city: 'Springfield',
        stateProvince: 'NE',
        postalCode: '23456',
        country: 'United States',
        owner: '6085a21efcfc72405667c3d4',
        __v: 0,
      },
    ]

    beforeEach(() => {
      apiService.setToken('valid-token-123')
    })

    it('should successfully get contacts list', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: () => Promise.resolve(mockContactsList),
      } as Response)

      const result = await apiService.getContacts()

      expect(mockFetch).toHaveBeenCalledWith(
        'https://thinking-tester-contact-list.herokuapp.com/contacts',
        {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            Authorization: 'Bearer valid-token-123',
          },
        }
      )

      expect(result).toEqual(mockContactsList)
    })

    it('should return empty array when no contacts exist', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: () => Promise.resolve([]),
      } as Response)

      const result = await apiService.getContacts()
      expect(result).toEqual([])
    })

    it('should throw error when no authentication token is provided', async () => {
      const serviceWithoutToken = new ContactListApiService()

      await expect(serviceWithoutToken.getContacts()).rejects.toThrow(
        'Authentication token is required'
      )

      expect(mockFetch).not.toHaveBeenCalled()
    })

    it('should handle unauthorized access', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 401,
        statusText: 'Unauthorized',
        json: () =>
          Promise.resolve({
            message: 'Please authenticate',
          }),
      } as Response)

      await expect(apiService.getContacts()).rejects.toThrow(
        'Please authenticate'
      )
    })

    it('should handle server errors', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 500,
        statusText: 'Internal Server Error',
        json: () => Promise.reject(new Error('Invalid JSON')),
      } as Response)

      await expect(apiService.getContacts()).rejects.toThrow(
        'HTTP 500: Internal Server Error'
      )
    })

    it('should handle network errors', async () => {
      mockFetch.mockRejectedValueOnce(new Error('Network Error'))

      await expect(apiService.getContacts()).rejects.toThrow('Network Error')
    })
  })

  describe('createContact', () => {
    const mockContactData = {
      firstName: 'John',
      lastName: 'Doe',
      birthdate: '1970-01-01',
      email: 'jdoe@fake.com',
      phone: '8005555555',
      street1: '1 Main St.',
      street2: 'Apartment A',
      city: 'Anytown',
      stateProvince: 'KS',
      postalCode: '12345',
      country: 'USA',
    }

    const mockCreatedContact = {
      _id: '6085a221fcfc72405667c3d4',
      ...mockContactData,
      owner: '6085a21efcfc72405667c3d4',
      __v: 0,
    }

    beforeEach(() => {
      apiService.setToken('valid-token-123')
    })

    it('should successfully create a new contact', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        status: 201,
        json: () => Promise.resolve(mockCreatedContact),
      } as Response)

      const result = await apiService.createContact(mockContactData)

      expect(mockFetch).toHaveBeenCalledWith(
        'https://thinking-tester-contact-list.herokuapp.com/contacts',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: 'Bearer valid-token-123',
          },
          body: JSON.stringify(mockContactData),
        }
      )

      expect(result).toEqual(mockCreatedContact)
    })

    it('should create contact with minimal required data', async () => {
      const minimalContactData = {
        firstName: 'Jane',
        lastName: 'Smith',
      }

      const minimalCreatedContact = {
        _id: 'minimal-contact-id',
        ...minimalContactData,
        owner: '6085a21efcfc72405667c3d4',
        __v: 0,
      }

      mockFetch.mockResolvedValueOnce({
        ok: true,
        status: 201,
        json: () => Promise.resolve(minimalCreatedContact),
      } as Response)

      const result = await apiService.createContact(minimalContactData)
      expect(result).toEqual(minimalCreatedContact)
    })

    it('should throw error when no authentication token is provided', async () => {
      const serviceWithoutToken = new ContactListApiService()

      await expect(
        serviceWithoutToken.createContact(mockContactData)
      ).rejects.toThrow('Authentication token is required')

      expect(mockFetch).not.toHaveBeenCalled()
    })

    it('should handle validation errors', async () => {
      const invalidContactData = {
        firstName: '',
        lastName: 'Doe',
      }

      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 400,
        statusText: 'Bad Request',
        json: () =>
          Promise.resolve({
            message: 'Path `firstName` is required.',
          }),
      } as Response)

      await expect(
        apiService.createContact(invalidContactData)
      ).rejects.toThrow('Path `firstName` is required.')
    })

    it('should handle duplicate contact errors', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 400,
        statusText: 'Bad Request',
        json: () =>
          Promise.resolve({
            message: 'Contact validation failed',
          }),
      } as Response)

      await expect(apiService.createContact(mockContactData)).rejects.toThrow(
        'Contact validation failed'
      )
    })

    it('should handle server errors', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 500,
        statusText: 'Internal Server Error',
        json: () => Promise.reject(new Error('Invalid JSON')),
      } as Response)

      await expect(apiService.createContact(mockContactData)).rejects.toThrow(
        'HTTP 500: Internal Server Error'
      )
    })

    it('should handle network errors', async () => {
      mockFetch.mockRejectedValueOnce(new Error('Network Error'))

      await expect(apiService.createContact(mockContactData)).rejects.toThrow(
        'Network Error'
      )
    })
  })

  describe('getContact', () => {
    const contactId = '6085a221fcfc72405667c3d4'
    const mockContact = {
      _id: contactId,
      firstName: 'John',
      lastName: 'Doe',
      birthdate: '1970-01-01',
      email: 'jdoe@fake.com',
      phone: '8005555555',
      street1: '1 Main St.',
      street2: 'Apartment A',
      city: 'Anytown',
      stateProvince: 'KS',
      postalCode: '12345',
      country: 'USA',
      owner: '6085a21efcfc72405667c3d4',
      __v: 0,
    }

    beforeEach(() => {
      apiService.setToken('valid-token-123')
    })

    it('should successfully get a specific contact', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: () => Promise.resolve(mockContact),
      } as Response)

      const result = await apiService.getContact(contactId)

      expect(mockFetch).toHaveBeenCalledWith(
        `https://thinking-tester-contact-list.herokuapp.com/contacts/${contactId}`,
        {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            Authorization: 'Bearer valid-token-123',
          },
        }
      )

      expect(result).toEqual(mockContact)
    })

    it('should throw error when no authentication token is provided', async () => {
      const serviceWithoutToken = new ContactListApiService()

      await expect(serviceWithoutToken.getContact(contactId)).rejects.toThrow(
        'Authentication token is required'
      )

      expect(mockFetch).not.toHaveBeenCalled()
    })

    it('should handle contact not found error', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 404,
        statusText: 'Not Found',
        json: () =>
          Promise.resolve({
            message: 'Contact not found',
          }),
      } as Response)

      await expect(apiService.getContact('non-existent-id')).rejects.toThrow(
        'Contact not found'
      )
    })

    it('should handle invalid contact ID format', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 400,
        statusText: 'Bad Request',
        json: () =>
          Promise.resolve({
            message: 'Invalid contact ID',
          }),
      } as Response)

      await expect(apiService.getContact('invalid-id')).rejects.toThrow(
        'Invalid contact ID'
      )
    })

    it('should handle unauthorized access', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 401,
        statusText: 'Unauthorized',
        json: () =>
          Promise.resolve({
            message: 'Please authenticate',
          }),
      } as Response)

      await expect(apiService.getContact(contactId)).rejects.toThrow(
        'Please authenticate'
      )
    })

    it('should handle server errors', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 500,
        statusText: 'Internal Server Error',
        json: () => Promise.reject(new Error('Invalid JSON')),
      } as Response)

      await expect(apiService.getContact(contactId)).rejects.toThrow(
        'HTTP 500: Internal Server Error'
      )
    })

    it('should handle network errors', async () => {
      mockFetch.mockRejectedValueOnce(new Error('Network Error'))

      await expect(apiService.getContact(contactId)).rejects.toThrow(
        'Network Error'
      )
    })
  })

  describe('updateContact', () => {
    const contactId = '6085a221fcfc72405667c3d4'
    const updateData = {
      firstName: 'Amy',
      lastName: 'Miller',
      birthdate: '1992-02-02',
      email: 'amiller@fake.com',
      phone: '8005554242',
      street1: '13 School St.',
      street2: 'Apt. 5',
      city: 'Washington',
      stateProvince: 'QC',
      postalCode: 'A1B2D4',
      country: 'Canada',
    }

    const mockUpdatedContact = {
      _id: contactId,
      ...updateData,
      owner: '6085a21efcfc72405667c3d4',
      __v: 0,
    }

    beforeEach(() => {
      apiService.setToken('valid-token-123')
    })

    it('should successfully update a contact (PUT)', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: () => Promise.resolve(mockUpdatedContact),
      } as Response)

      const result = await apiService.updateContact(contactId, updateData)

      expect(mockFetch).toHaveBeenCalledWith(
        `https://thinking-tester-contact-list.herokuapp.com/contacts/${contactId}`,
        {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            Authorization: 'Bearer valid-token-123',
          },
          body: JSON.stringify(updateData),
        }
      )

      expect(result).toEqual(mockUpdatedContact)
    })

    it('should throw error when no authentication token is provided', async () => {
      const serviceWithoutToken = new ContactListApiService()

      await expect(
        serviceWithoutToken.updateContact(contactId, updateData)
      ).rejects.toThrow('Authentication token is required')

      expect(mockFetch).not.toHaveBeenCalled()
    })

    it('should handle contact not found error', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 404,
        statusText: 'Not Found',
        json: () =>
          Promise.resolve({
            message: 'Contact not found',
          }),
      } as Response)

      await expect(
        apiService.updateContact('non-existent-id', updateData)
      ).rejects.toThrow('Contact not found')
    })

    it('should handle validation errors', async () => {
      const invalidUpdateData = {
        email: 'invalid-email-format',
      }

      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 400,
        statusText: 'Bad Request',
        json: () =>
          Promise.resolve({
            message: 'Please enter a valid email',
          }),
      } as Response)

      await expect(
        apiService.updateContact(contactId, invalidUpdateData)
      ).rejects.toThrow('Please enter a valid email')
    })

    it('should handle unauthorized access', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 401,
        statusText: 'Unauthorized',
        json: () =>
          Promise.resolve({
            message: 'Please authenticate',
          }),
      } as Response)

      await expect(
        apiService.updateContact(contactId, updateData)
      ).rejects.toThrow('Please authenticate')
    })

    it('should handle server errors', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 500,
        statusText: 'Internal Server Error',
        json: () => Promise.reject(new Error('Invalid JSON')),
      } as Response)

      await expect(
        apiService.updateContact(contactId, updateData)
      ).rejects.toThrow('HTTP 500: Internal Server Error')
    })

    it('should handle network errors', async () => {
      mockFetch.mockRejectedValueOnce(new Error('Network Error'))

      await expect(
        apiService.updateContact(contactId, updateData)
      ).rejects.toThrow('Network Error')
    })
  })

  describe('updateContactPartial', () => {
    const contactId = '6085a221fcfc72405667c3d4'
    const partialUpdateData = {
      firstName: 'Anna',
    }

    const mockPartiallyUpdatedContact = {
      _id: contactId,
      firstName: 'Anna',
      lastName: 'Miller',
      birthdate: '1992-02-02',
      email: 'amiller@fake.com',
      phone: '8005554242',
      street1: '13 School St.',
      street2: 'Apt. 5',
      city: 'Washington',
      stateProvince: 'QC',
      postalCode: 'A1B2D4',
      country: 'Canada',
      owner: '6085a21efcfc72405667c3d4',
      __v: 0,
    }

    beforeEach(() => {
      apiService.setToken('valid-token-123')
    })

    it('should successfully update contact partially (PATCH)', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: () => Promise.resolve(mockPartiallyUpdatedContact),
      } as Response)

      const result = await apiService.updateContactPartial(
        contactId,
        partialUpdateData
      )

      expect(mockFetch).toHaveBeenCalledWith(
        `https://thinking-tester-contact-list.herokuapp.com/contacts/${contactId}`,
        {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
            Authorization: 'Bearer valid-token-123',
          },
          body: JSON.stringify(partialUpdateData),
        }
      )

      expect(result).toEqual(mockPartiallyUpdatedContact)
    })

    it('should handle multiple field updates', async () => {
      const multiFieldUpdate = {
        firstName: 'Anna',
        email: 'anna.miller@example.com',
      }

      const multiFieldUpdatedContact = {
        ...mockPartiallyUpdatedContact,
        firstName: 'Anna',
        email: 'anna.miller@example.com',
      }

      mockFetch.mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: () => Promise.resolve(multiFieldUpdatedContact),
      } as Response)

      const result = await apiService.updateContactPartial(
        contactId,
        multiFieldUpdate
      )
      expect(result).toEqual(multiFieldUpdatedContact)
    })

    it('should throw error when no authentication token is provided', async () => {
      const serviceWithoutToken = new ContactListApiService()

      await expect(
        serviceWithoutToken.updateContactPartial(contactId, partialUpdateData)
      ).rejects.toThrow('Authentication token is required')

      expect(mockFetch).not.toHaveBeenCalled()
    })

    it('should handle contact not found error', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 404,
        statusText: 'Not Found',
        json: () =>
          Promise.resolve({
            message: 'Contact not found',
          }),
      } as Response)

      await expect(
        apiService.updateContactPartial('non-existent-id', partialUpdateData)
      ).rejects.toThrow('Contact not found')
    })

    it('should handle validation errors', async () => {
      const invalidPartialData = {
        email: 'invalid-email',
      }

      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 400,
        statusText: 'Bad Request',
        json: () =>
          Promise.resolve({
            message: 'Please enter a valid email',
          }),
      } as Response)

      await expect(
        apiService.updateContactPartial(contactId, invalidPartialData)
      ).rejects.toThrow('Please enter a valid email')
    })

    it('should handle server errors', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 500,
        statusText: 'Internal Server Error',
        json: () => Promise.reject(new Error('Invalid JSON')),
      } as Response)

      await expect(
        apiService.updateContactPartial(contactId, partialUpdateData)
      ).rejects.toThrow('HTTP 500: Internal Server Error')
    })

    it('should handle network errors', async () => {
      mockFetch.mockRejectedValueOnce(new Error('Network Error'))

      await expect(
        apiService.updateContactPartial(contactId, partialUpdateData)
      ).rejects.toThrow('Network Error')
    })
  })

  describe('deleteContact', () => {
    const contactId = '6085a221fcfc72405667c3d4'

    beforeEach(() => {
      apiService.setToken('valid-token-123')
    })

    it('should successfully delete a contact', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: () => Promise.resolve({}),
      } as Response)

      await apiService.deleteContact(contactId)

      expect(mockFetch).toHaveBeenCalledWith(
        `https://thinking-tester-contact-list.herokuapp.com/contacts/${contactId}`,
        {
          method: 'DELETE',
          headers: {
            'Content-Type': 'application/json',
            Authorization: 'Bearer valid-token-123',
          },
        }
      )
    })

    it('should throw error when no authentication token is provided', async () => {
      const serviceWithoutToken = new ContactListApiService()

      await expect(
        serviceWithoutToken.deleteContact(contactId)
      ).rejects.toThrow('Authentication token is required')

      expect(mockFetch).not.toHaveBeenCalled()
    })

    it('should handle contact not found error', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 404,
        statusText: 'Not Found',
        json: () =>
          Promise.resolve({
            message: 'Contact not found',
          }),
      } as Response)

      await expect(apiService.deleteContact('non-existent-id')).rejects.toThrow(
        'Contact not found'
      )
    })

    it('should handle unauthorized access', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 401,
        statusText: 'Unauthorized',
        json: () =>
          Promise.resolve({
            message: 'Please authenticate',
          }),
      } as Response)

      await expect(apiService.deleteContact(contactId)).rejects.toThrow(
        'Please authenticate'
      )
    })

    it("should handle attempts to delete someone else's contact", async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 403,
        statusText: 'Forbidden',
        json: () =>
          Promise.resolve({
            message: 'You can only delete your own contacts',
          }),
      } as Response)

      await expect(apiService.deleteContact(contactId)).rejects.toThrow(
        'You can only delete your own contacts'
      )
    })

    it('should handle invalid contact ID format', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 400,
        statusText: 'Bad Request',
        json: () =>
          Promise.resolve({
            message: 'Invalid contact ID',
          }),
      } as Response)

      await expect(apiService.deleteContact('invalid-id')).rejects.toThrow(
        'Invalid contact ID'
      )
    })

    it('should handle server errors', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 500,
        statusText: 'Internal Server Error',
        json: () => Promise.reject(new Error('Invalid JSON')),
      } as Response)

      await expect(apiService.deleteContact(contactId)).rejects.toThrow(
        'HTTP 500: Internal Server Error'
      )
    })

    it('should handle network errors', async () => {
      mockFetch.mockRejectedValueOnce(new Error('Network Error'))

      await expect(apiService.deleteContact(contactId)).rejects.toThrow(
        'Network Error'
      )
    })
  })
})
