// Tests de integración para el flujo de cierre de sesión

import axios from 'axios'
import { API_BASE_URL, TEST_CONFIG, generateTestUser, delay } from './setup'

describe('Integration Tests - User Logout Flow', () => {
  let testUser: any
  let userToken: string

  beforeEach(() => {
    jest.setTimeout(TEST_CONFIG.timeout)
  })

  afterEach(async () => {
    // Pequeño delay entre tests para evitar rate limiting
    await delay(1000)
  })

  // Setup: Crear y loguear un usuario para cada test
  beforeEach(async () => {
    testUser = generateTestUser()

    try {
      // Registrar usuario
      const registrationResponse = await axios.post(
        `${API_BASE_URL}/users`,
        testUser
      )
      userToken = registrationResponse.data.token
    } catch (error: any) {
      throw new Error(
        `Failed to create test user: ${
          error.response?.data?.message || error.message
        }`
      )
    }
  })

  describe('Successful Logout Flow', () => {
    it('should logout successfully with valid token', async () => {
      try {
        // Verificar que el token funciona antes del logout
        const profileResponse = await axios.get(`${API_BASE_URL}/users/me`, {
          headers: {
            Authorization: `Bearer ${userToken}`,
          },
        })
        expect(profileResponse.status).toBe(200)

        // Realizar logout
        const logoutResponse = await axios.post(
          `${API_BASE_URL}/users/logout`,
          {},
          {
            headers: {
              Authorization: `Bearer ${userToken}`,
            },
          }
        )

        expect(logoutResponse.status).toBe(200)
      } catch (error: any) {
        throw new Error(
          `Logout failed: ${error.response?.data?.message || error.message}`
        )
      }
    })

    it('should invalidate token after logout', async () => {
      try {
        // Verificar que el token funciona antes del logout
        const beforeLogoutResponse = await axios.get(
          `${API_BASE_URL}/users/me`,
          {
            headers: {
              Authorization: `Bearer ${userToken}`,
            },
          }
        )
        expect(beforeLogoutResponse.status).toBe(200)

        // Realizar logout
        const logoutResponse = await axios.post(
          `${API_BASE_URL}/users/logout`,
          {},
          {
            headers: {
              Authorization: `Bearer ${userToken}`,
            },
          }
        )
        expect(logoutResponse.status).toBe(200)

        // Intentar usar el token después del logout
        try {
          await axios.get(`${API_BASE_URL}/users/me`, {
            headers: {
              Authorization: `Bearer ${userToken}`,
            },
          })
          fail('Token should be invalid after logout')
        } catch (tokenError: any) {
          expect(tokenError.response.status).toBe(401)
        }
      } catch (error: any) {
        throw new Error(
          `Token invalidation test failed: ${
            error.response?.data?.message || error.message
          }`
        )
      }
    })

    it('should complete full user session cycle', async () => {
      try {
        // Paso 1: Verificar acceso con token inicial
        const initialAccessResponse = await axios.get(
          `${API_BASE_URL}/users/me`,
          {
            headers: {
              Authorization: `Bearer ${userToken}`,
            },
          }
        )
        expect(initialAccessResponse.status).toBe(200)

        // Paso 2: Logout
        const logoutResponse = await axios.post(
          `${API_BASE_URL}/users/logout`,
          {},
          {
            headers: {
              Authorization: `Bearer ${userToken}`,
            },
          }
        )
        expect(logoutResponse.status).toBe(200)

        // Paso 3: Login nuevamente
        const loginResponse = await axios.post(`${API_BASE_URL}/users/login`, {
          email: testUser.email,
          password: testUser.password,
        })
        expect(loginResponse.status).toBe(200)

        const newToken = loginResponse.data.token
        expect(newToken).toBeDefined()
        expect(newToken).not.toBe(userToken) // Debería ser un token diferente

        // Paso 4: Verificar acceso con nuevo token
        const finalAccessResponse = await axios.get(
          `${API_BASE_URL}/users/me`,
          {
            headers: {
              Authorization: `Bearer ${newToken}`,
            },
          }
        )
        expect(finalAccessResponse.status).toBe(200)
        expect(finalAccessResponse.data.email).toBe(testUser.email)
      } catch (error: any) {
        throw new Error(
          `Full session cycle failed: ${
            error.response?.data?.message || error.message
          }`
        )
      }
    })
  })

  describe('Logout Validation', () => {
    it('should reject logout without authorization header', async () => {
      try {
        await axios.post(`${API_BASE_URL}/users/logout`, {})
        fail('Should have thrown an error for missing authorization')
      } catch (error: any) {
        expect(error.response.status).toBe(401)
        // La API responde con 401 para requests sin autorización
      }
    })

    it('should reject logout with invalid token', async () => {
      try {
        await axios.post(
          `${API_BASE_URL}/users/logout`,
          {},
          {
            headers: {
              Authorization: 'Bearer invalid-token-123',
            },
          }
        )
        fail('Should have thrown an error for invalid token')
      } catch (error: any) {
        expect(error.response.status).toBe(401)
        // La API responde con 401 para tokens inválidos
      }
    })

    it('should reject logout with malformed authorization header', async () => {
      try {
        await axios.post(
          `${API_BASE_URL}/users/logout`,
          {},
          {
            headers: {
              Authorization: 'InvalidFormat token123',
            },
          }
        )
        fail('Should have thrown an error for malformed header')
      } catch (error: any) {
        expect(error.response.status).toBe(401)
        // La API responde con 401 para headers malformados
      }
    })

    it('should reject logout with empty authorization header', async () => {
      try {
        await axios.post(
          `${API_BASE_URL}/users/logout`,
          {},
          {
            headers: {
              Authorization: '',
            },
          }
        )
        fail('Should have thrown an error for empty authorization')
      } catch (error: any) {
        expect(error.response.status).toBe(401)
        // La API responde con 401 para autorización vacía
      }
    })
  })

  describe('Logout Edge Cases', () => {
    it('should handle double logout gracefully', async () => {
      try {
        // Primer logout
        const firstLogoutResponse = await axios.post(
          `${API_BASE_URL}/users/logout`,
          {},
          {
            headers: {
              Authorization: `Bearer ${userToken}`,
            },
          }
        )
        expect(firstLogoutResponse.status).toBe(200)

        // Segundo logout con el mismo token
        try {
          await axios.post(
            `${API_BASE_URL}/users/logout`,
            {},
            {
              headers: {
                Authorization: `Bearer ${userToken}`,
              },
            }
          )
          fail('Second logout should fail with invalid token')
        } catch (secondLogoutError: any) {
          expect(secondLogoutError.response.status).toBe(401)
        }
      } catch (error: any) {
        throw new Error(
          `Double logout test failed: ${
            error.response?.data?.message || error.message
          }`
        )
      }
    })

    it('should handle logout with expired token gracefully', async () => {
      // Este test simula un token expirado usando un token inválido
      const expiredToken =
        'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJleHAiOjE2MzQ1NjQwMDB9.invalid'

      try {
        await axios.post(
          `${API_BASE_URL}/users/logout`,
          {},
          {
            headers: {
              Authorization: `Bearer ${expiredToken}`,
            },
          }
        )
        fail('Should have thrown an error for expired token')
      } catch (error: any) {
        expect(error.response.status).toBe(401)
        // La API responde con 401 para tokens expirados
      }
    })
  })
})
