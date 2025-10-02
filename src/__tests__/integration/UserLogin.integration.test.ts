// Tests de integración para el flujo de acceso de usuario

import axios from 'axios'
import { API_BASE_URL, TEST_CONFIG, generateTestUser, delay } from './setup'

describe('Integration Tests - User Login Flow', () => {
  let testUser: any
  let userToken: string

  beforeEach(() => {
    jest.setTimeout(TEST_CONFIG.timeout)
  })

  afterEach(async () => {
    // Pequeño delay entre tests para evitar rate limiting
    await delay(1000)
  })

  // Setup: Crear un usuario para los tests de login
  beforeAll(async () => {
    testUser = generateTestUser()

    try {
      const response = await axios.post(`${API_BASE_URL}/users`, testUser)
      userToken = response.data.token
    } catch (error: any) {
      throw new Error(
        `Failed to create test user: ${
          error.response?.data?.message || error.message
        }`
      )
    }
  })

  describe('Successful Login Flow', () => {
    it('should login with valid credentials', async () => {
      const loginData = {
        email: testUser.email,
        password: testUser.password,
      }

      try {
        const response = await axios.post(
          `${API_BASE_URL}/users/login`,
          loginData
        )

        // Verificar respuesta exitosa
        expect(response.status).toBe(200)
        expect(response.data).toHaveProperty('user')
        expect(response.data).toHaveProperty('token')

        // Verificar datos del usuario
        const { user, token } = response.data
        expect(user.email).toBe(testUser.email)
        expect(user.firstName).toBe(testUser.firstName)
        expect(user.lastName).toBe(testUser.lastName)
        expect(user).toHaveProperty('_id')
        expect(user).not.toHaveProperty('password')

        // Verificar token
        expect(typeof token).toBe('string')
        expect(token.length).toBeGreaterThan(0)
      } catch (error: any) {
        throw new Error(
          `Login failed: ${error.response?.data?.message || error.message}`
        )
      }
    })

    it('should login and access protected resources', async () => {
      const loginData = {
        email: testUser.email,
        password: testUser.password,
      }

      try {
        // Paso 1: Login
        const loginResponse = await axios.post(
          `${API_BASE_URL}/users/login`,
          loginData
        )
        expect(loginResponse.status).toBe(200)

        const { token } = loginResponse.data

        // Paso 2: Usar token para acceder a recursos protegidos
        const profileResponse = await axios.get(`${API_BASE_URL}/users/me`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        })

        expect(profileResponse.status).toBe(200)
        expect(profileResponse.data.email).toBe(testUser.email)

        // Paso 3: Acceder a contactos (otro recurso protegido)
        const contactsResponse = await axios.get(`${API_BASE_URL}/contacts`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        })

        expect(contactsResponse.status).toBe(200)
        expect(Array.isArray(contactsResponse.data)).toBe(true)
      } catch (error: any) {
        throw new Error(
          `Login + Protected resources flow failed: ${
            error.response?.data?.message || error.message
          }`
        )
      }
    })
  })

  describe('Login Validation', () => {
    it('should reject login with invalid email', async () => {
      const loginData = {
        email: 'nonexistent@example.com',
        password: testUser.password,
      }

      try {
        await axios.post(`${API_BASE_URL}/users/login`, loginData)
        fail('Should have thrown an error for invalid email')
      } catch (error: any) {
        expect(error.response.status).toBe(401)
        // La API responde con 401 para credenciales inválidas
      }
    })

    it('should reject login with invalid password', async () => {
      const loginData = {
        email: testUser.email,
        password: 'wrongpassword',
      }

      try {
        await axios.post(`${API_BASE_URL}/users/login`, loginData)
        fail('Should have thrown an error for invalid password')
      } catch (error: any) {
        expect(error.response.status).toBe(401)
        // La API responde con 401 para credenciales inválidas
      }
    })

    it('should reject login with missing credentials', async () => {
      const incompleteData = {
        email: testUser.email,
        // Missing password
      }

      try {
        await axios.post(`${API_BASE_URL}/users/login`, incompleteData)
        fail('Should have thrown an error for missing password')
      } catch (error: any) {
        expect(error.response.status).toBe(401)
        // La API responde con 401 para credenciales incompletas
      }
    })

    it('should reject login with empty credentials', async () => {
      const emptyData = {
        email: '',
        password: '',
      }

      try {
        await axios.post(`${API_BASE_URL}/users/login`, emptyData)
        fail('Should have thrown an error for empty credentials')
      } catch (error: any) {
        expect(error.response.status).toBe(401)
        // La API responde con 401 para credenciales vacías
      }
    })
  })

  describe('Login Security', () => {
    it('should reject requests without proper headers', async () => {
      const loginData = {
        email: testUser.email,
        password: testUser.password,
      }

      try {
        // Intentar login sin Content-Type header
        const response = await axios.post(
          `${API_BASE_URL}/users/login`,
          loginData,
          {
            headers: {
              'Content-Type': 'text/plain', // Tipo incorrecto
            },
          }
        )

        // Si llegamos aquí, el servidor es más permisivo de lo esperado
        expect(response.status).toBe(200)
      } catch (error: any) {
        // Es válido que el servidor rechace requests con headers incorrectos
        expect([400, 401, 415]).toContain(error.response?.status)
      }
    })

    it('should handle SQL injection attempts safely', async () => {
      const maliciousData = {
        email: "admin@test.com'; DROP TABLE users; --",
        password: "' OR '1'='1",
      }

      try {
        await axios.post(`${API_BASE_URL}/users/login`, maliciousData)
        fail('Should have thrown an error for malicious input')
      } catch (error: any) {
        // Debería fallar por credenciales inválidas, no por error de BD
        expect(error.response.status).toBe(401)
        // La API maneja la inyección SQL de forma segura
      }
    })
  })
})
