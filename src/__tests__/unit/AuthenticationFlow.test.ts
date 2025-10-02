import { ContactListApiService } from '../../services/ContactListApiService'
import { ValidationUtils } from '../../utils/ValidationUtils'
import { RegisterData, LoginCredentials } from '../../types/api.types'

// Mock fetch globalmente
global.fetch = jest.fn()

describe('Authentication Flow Integration', () => {
  let apiService: ContactListApiService
  const mockFetch = fetch as jest.MockedFunction<typeof fetch>

  beforeEach(() => {
    apiService = new ContactListApiService()
    jest.clearAllMocks()
  })

  describe('Complete Authentication Workflow', () => {
    const testUserData: RegisterData = {
      firstName: 'Integration',
      lastName: 'Test',
      email: 'integration@test.com',
      password: 'testPassword123',
    }

    const testLoginCredentials: LoginCredentials = {
      email: 'integration@test.com',
      password: 'testPassword123',
    }

    it('should complete full registration → login → profile management → logout flow', async () => {
      // 1. REGISTRO
      const mockRegisterResponse = {
        user: {
          _id: 'integration-user-id',
          firstName: 'Integration',
          lastName: 'Test',
          email: 'integration@test.com',
        },
        token: 'register-token-123',
      }

      mockFetch.mockResolvedValueOnce({
        ok: true,
        status: 201,
        json: () => Promise.resolve(mockRegisterResponse),
      } as Response)

      const registerResult = await apiService.register(testUserData)
      expect(registerResult).toEqual(mockRegisterResponse)

      // 2. LOGIN (simulando nuevo session)
      const newApiService = new ContactListApiService()
      const mockLoginResponse = {
        user: {
          _id: 'integration-user-id',
          firstName: 'Integration',
          lastName: 'Test',
          email: 'integration@test.com',
          __v: 1,
        },
        token: 'login-token-456',
      }

      mockFetch.mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: () => Promise.resolve(mockLoginResponse),
      } as Response)

      const loginResult = await newApiService.login(testLoginCredentials)
      expect(loginResult).toEqual(mockLoginResponse)

      // 3. OBTENER PERFIL
      mockFetch.mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: () => Promise.resolve(mockLoginResponse.user),
      } as Response)

      const profileResult = await newApiService.getUserProfile()
      expect(profileResult).toEqual(mockLoginResponse.user)

      // 4. ACTUALIZAR PERFIL
      const updateData = {
        firstName: 'Updated Integration',
        email: 'updated-integration@test.com',
      }

      const mockUpdatedProfile = {
        ...mockLoginResponse.user,
        firstName: 'Updated Integration',
        email: 'updated-integration@test.com',
      }

      mockFetch.mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: () => Promise.resolve(mockUpdatedProfile),
      } as Response)

      const updateResult = await newApiService.updateUserProfile(updateData)
      expect(updateResult).toEqual(mockUpdatedProfile)

      // 5. LOGOUT
      mockFetch.mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: () => Promise.resolve({}),
      } as Response)

      await newApiService.logout()

      // 6. VERIFICAR QUE NO SE PUEDE ACCEDER SIN AUTENTICACIÓN
      await expect(newApiService.getUserProfile()).rejects.toThrow(
        'Authentication token is required'
      )
    })

    it('should handle authentication failure scenarios', async () => {
      // 1. REGISTRO CON EMAIL DUPLICADO
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 400,
        json: () =>
          Promise.resolve({
            message: 'Email address is already in use',
          }),
      } as Response)

      await expect(apiService.register(testUserData)).rejects.toThrow(
        'Email address is already in use'
      )

      // 2. LOGIN CON CREDENCIALES INCORRECTAS
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 401,
        json: () =>
          Promise.resolve({
            message: 'Invalid credentials',
          }),
      } as Response)

      await expect(apiService.login(testLoginCredentials)).rejects.toThrow(
        'Invalid credentials'
      )

      // 3. ACCESO SIN TOKEN
      await expect(apiService.getUserProfile()).rejects.toThrow(
        'Authentication token is required'
      )

      await expect(
        apiService.updateUserProfile({ firstName: 'Test' })
      ).rejects.toThrow('Authentication token is required')

      await expect(apiService.logout()).rejects.toThrow(
        'Authentication token is required'
      )

      await expect(apiService.deleteUser()).rejects.toThrow(
        'Authentication token is required'
      )
    })
  })

  describe('Data Validation Integration', () => {
    it('should validate user data before registration', () => {
      const userData: RegisterData = {
        firstName: 'Valid',
        lastName: 'User',
        email: 'valid@email.com',
        password: 'validPassword123',
      }

      // Validar datos antes de enviar
      expect(ValidationUtils.isValidName(userData.firstName)).toBe(true)
      expect(ValidationUtils.isValidName(userData.lastName)).toBe(true)
      expect(ValidationUtils.isValidEmail(userData.email)).toBe(true)
      expect(ValidationUtils.isValidPassword(userData.password)).toBe(true)
    })

    it('should validate login credentials before sending', () => {
      const credentials: LoginCredentials = {
        email: 'test@example.com',
        password: 'validPassword',
      }

      expect(ValidationUtils.isValidEmail(credentials.email)).toBe(true)
      expect(ValidationUtils.isValidPassword(credentials.password)).toBe(true)
    })

    it('should detect invalid data and prevent API calls', () => {
      const invalidRegistrationData = [
        {
          firstName: '',
          lastName: 'User',
          email: 'valid@email.com',
          password: 'validPassword123',
        },
        {
          firstName: 'Valid',
          lastName: 'User',
          email: 'invalid-email',
          password: 'validPassword123',
        },
        {
          firstName: 'Valid',
          lastName: 'User',
          email: 'valid@email.com',
          password: '123', // Muy corta
        },
      ]

      invalidRegistrationData.forEach((data) => {
        const isValidData =
          ValidationUtils.isValidName(data.firstName) &&
          ValidationUtils.isValidName(data.lastName) &&
          ValidationUtils.isValidEmail(data.email) &&
          ValidationUtils.isValidPassword(data.password)

        expect(isValidData).toBe(false)
      })
    })
  })

  describe('Token Management Integration', () => {
    it('should handle token lifecycle correctly', async () => {
      // 1. Sin token inicial
      await expect(apiService.getUserProfile()).rejects.toThrow(
        'Authentication token is required'
      )

      // 2. Registro establece token automáticamente
      mockFetch.mockResolvedValueOnce({
        ok: true,
        status: 201,
        json: () =>
          Promise.resolve({
            user: {
              _id: 'test-id',
              firstName: 'Test',
              lastName: 'User',
              email: 'test@test.com',
            },
            token: 'auto-set-token',
          }),
      } as Response)

      await apiService.register({
        firstName: 'Test',
        lastName: 'User',
        email: 'test@test.com',
        password: 'password123',
      })

      // 3. Ahora se puede acceder con el token
      mockFetch.mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: () =>
          Promise.resolve({
            _id: 'test-id',
            firstName: 'Test',
            lastName: 'User',
            email: 'test@test.com',
          }),
      } as Response)

      const profile = await apiService.getUserProfile()
      expect(profile).toBeDefined()

      // 4. Logout limpia el token
      mockFetch.mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: () => Promise.resolve({}),
      } as Response)

      await apiService.logout()

      // 5. Ya no se puede acceder después del logout
      await expect(apiService.getUserProfile()).rejects.toThrow(
        'Authentication token is required'
      )
    })

    it('should handle token cleanup after user deletion', async () => {
      // Establecer token
      apiService.setToken('test-token')

      // Eliminar usuario
      mockFetch.mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: () => Promise.resolve({}),
      } as Response)

      await apiService.deleteUser()

      // Verificar que el token se limpió
      await expect(apiService.getUserProfile()).rejects.toThrow(
        'Authentication token is required'
      )
    })
  })

  describe('Error Recovery Scenarios', () => {
    it('should handle network failures gracefully', async () => {
      // Error de red en registro
      mockFetch.mockRejectedValueOnce(new Error('Network Error'))
      await expect(
        apiService.register({
          firstName: 'Test',
          lastName: 'User',
          email: 'test@test.com',
          password: 'password123',
        })
      ).rejects.toThrow('Network Error')

      // Error de red en login
      mockFetch.mockRejectedValueOnce(new Error('Network Error'))
      await expect(
        apiService.login({
          email: 'test@test.com',
          password: 'password123',
        })
      ).rejects.toThrow('Network Error')

      // El servicio debe seguir funcionando después de errores de red
      mockFetch.mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: () =>
          Promise.resolve({
            user: {
              _id: 'test',
              firstName: 'Test',
              lastName: 'User',
              email: 'test@test.com',
            },
            token: 'recovery-token',
          }),
      } as Response)

      const result = await apiService.login({
        email: 'test@test.com',
        password: 'password123',
      })

      expect(result).toBeDefined()
      expect(result.token).toBe('recovery-token')
    })
  })
})
