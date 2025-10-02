// Tests de integración para el flujo de registro de usuario

import axios from 'axios'
import { API_BASE_URL, TEST_CONFIG, generateTestUser, delay } from './setup'

describe('Integration Tests - User Registration Flow', () => {
  // Configurar timeout para tests de integración
  beforeEach(() => {
    jest.setTimeout(TEST_CONFIG.timeout)
  })

  afterEach(async () => {
    // Pequeño delay entre tests para evitar rate limiting
    await delay(1000)
  })

  describe('Successful Registration Flow', () => {
    it('should register a new user with valid data', async () => {
      const testUser = generateTestUser()

      try {
        const response = await axios.post(`${API_BASE_URL}/users`, testUser)

        // Verificar respuesta exitosa
        expect(response.status).toBe(201)
        expect(response.data).toHaveProperty('user')
        expect(response.data).toHaveProperty('token')

        // Verificar datos del usuario
        const { user, token } = response.data
        expect(user.firstName).toBe(testUser.firstName)
        expect(user.lastName).toBe(testUser.lastName)
        expect(user.email).toBe(testUser.email)
        expect(user).toHaveProperty('_id')
        expect(user).not.toHaveProperty('password') // Password no debe retornarse

        // Verificar token
        expect(typeof token).toBe('string')
        expect(token.length).toBeGreaterThan(0)
      } catch (error: any) {
        throw new Error(
          `Registration failed: ${
            error.response?.data?.message || error.message
          }`
        )
      }
    })

    it('should register and immediately access user profile', async () => {
      const testUser = generateTestUser()

      try {
        // Paso 1: Registrar usuario
        const registrationResponse = await axios.post(
          `${API_BASE_URL}/users`,
          testUser
        )
        expect(registrationResponse.status).toBe(201)

        const { token, user } = registrationResponse.data

        // Paso 2: Usar el token para acceder al perfil
        const profileResponse = await axios.get(`${API_BASE_URL}/users/me`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        })

        expect(profileResponse.status).toBe(200)
        expect(profileResponse.data._id).toBe(user._id)
        expect(profileResponse.data.email).toBe(testUser.email)
      } catch (error: any) {
        throw new Error(
          `Registration + Profile flow failed: ${
            error.response?.data?.message || error.message
          }`
        )
      }
    })
  })

  describe('Registration Validation', () => {
    it('should reject registration with invalid email', async () => {
      const testUser = generateTestUser()
      testUser.email = 'invalid-email-format'

      try {
        await axios.post(`${API_BASE_URL}/users`, testUser)
        fail('Should have thrown an error for invalid email')
      } catch (error: any) {
        expect(error.response.status).toBe(400)
        expect(error.response.data).toHaveProperty('message')
      }
    })

    it('should reject registration with short password', async () => {
      const testUser = generateTestUser()
      testUser.password = '123' // Muy corta

      try {
        await axios.post(`${API_BASE_URL}/users`, testUser)
        fail('Should have thrown an error for short password')
      } catch (error: any) {
        expect(error.response.status).toBe(400)
        expect(error.response.data).toHaveProperty('message')
      }
    })

    it('should reject registration with missing required fields', async () => {
      const incompleteUser = {
        firstName: 'Test',
        // Missing lastName, email, password
      }

      try {
        await axios.post(`${API_BASE_URL}/users`, incompleteUser)
        fail('Should have thrown an error for missing fields')
      } catch (error: any) {
        expect(error.response.status).toBe(400)
        expect(error.response.data).toHaveProperty('message')
      }
    })

    it('should reject registration with duplicate email', async () => {
      const testUser = generateTestUser()

      try {
        // Primer registro
        await axios.post(`${API_BASE_URL}/users`, testUser)

        // Segundo registro con mismo email
        await axios.post(`${API_BASE_URL}/users`, testUser)
        fail('Should have thrown an error for duplicate email')
      } catch (error: any) {
        // La primera llamada debería funcionar, la segunda fallar
        if (error.response?.status === 201) {
          // Si la primera funcionó, intentar la segunda
          try {
            await axios.post(`${API_BASE_URL}/users`, testUser)
            fail('Should have thrown an error for duplicate email')
          } catch (secondError: any) {
            expect(secondError.response.status).toBe(400)
            expect(secondError.response.data).toHaveProperty('message')
          }
        } else {
          // Si falló en el primer intento, verificar que es por duplicado
          expect(error.response.status).toBe(400)
        }
      }
    })
  })

  describe('Registration Edge Cases', () => {
    it('should handle special characters in names', async () => {
      const testUser = generateTestUser()
      testUser.firstName = 'José María'
      testUser.lastName = 'García-López'

      try {
        const response = await axios.post(`${API_BASE_URL}/users`, testUser)
        expect(response.status).toBe(201)
        expect(response.data.user.firstName).toBe(testUser.firstName)
        expect(response.data.user.lastName).toBe(testUser.lastName)
      } catch (error: any) {
        throw new Error(
          `Special characters test failed: ${
            error.response?.data?.message || error.message
          }`
        )
      }
    })

    it('should handle maximum length fields', async () => {
      const testUser = generateTestUser()
      testUser.firstName = 'A'.repeat(20) // Máximo permitido
      testUser.lastName = 'B'.repeat(20)

      try {
        const response = await axios.post(`${API_BASE_URL}/users`, testUser)
        expect(response.status).toBe(201)
        expect(response.data.user.firstName).toBe(testUser.firstName)
        expect(response.data.user.lastName).toBe(testUser.lastName)
      } catch (error: any) {
        throw new Error(
          `Max length test failed: ${
            error.response?.data?.message || error.message
          }`
        )
      }
    })
  })
})
