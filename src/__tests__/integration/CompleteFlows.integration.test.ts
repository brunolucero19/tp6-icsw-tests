// Tests de integración para flujos completos end-to-end

import axios from 'axios'
import {
  API_BASE_URL,
  TEST_CONFIG,
  generateTestUser,
  generateTestContact,
  delay,
} from './setup'

describe('Integration Tests - Complete User Flows', () => {
  beforeEach(() => {
    jest.setTimeout(TEST_CONFIG.timeout)
  })

  afterEach(async () => {
    // Pequeño delay entre tests para evitar rate limiting
    await delay(1500)
  })

  describe('Complete User Journey', () => {
    it('should complete full user registration → login → profile → logout flow', async () => {
      const testUser = generateTestUser()
      let userToken: string

      try {
        // PASO 1: Registro de usuario
        console.log('Step 1: User Registration')
        const registrationResponse = await axios.post(
          `${API_BASE_URL}/users`,
          testUser
        )

        expect(registrationResponse.status).toBe(201)
        expect(registrationResponse.data.user.email).toBe(testUser.email)
        expect(registrationResponse.data).toHaveProperty('token')

        const initialToken = registrationResponse.data.token

        // PASO 2: Logout de la sesión inicial
        console.log('Step 2: Initial Logout')
        await axios.post(
          `${API_BASE_URL}/users/logout`,
          {},
          {
            headers: { Authorization: `Bearer ${initialToken}` },
          }
        )

        await delay(1000)

        // PASO 3: Login explícito
        console.log('Step 3: User Login')
        const loginResponse = await axios.post(`${API_BASE_URL}/users/login`, {
          email: testUser.email,
          password: testUser.password,
        })

        expect(loginResponse.status).toBe(200)
        expect(loginResponse.data.user.email).toBe(testUser.email)
        expect(loginResponse.data).toHaveProperty('token')

        userToken = loginResponse.data.token
        expect(userToken).not.toBe(initialToken) // Token debería ser diferente

        await delay(500)

        // PASO 4: Acceso al perfil con token de login
        console.log('Step 4: Profile Access')
        const profileResponse = await axios.get(`${API_BASE_URL}/users/me`, {
          headers: { Authorization: `Bearer ${userToken}` },
        })

        expect(profileResponse.status).toBe(200)
        expect(profileResponse.data.email).toBe(testUser.email)
        expect(profileResponse.data.firstName).toBe(testUser.firstName)

        await delay(500)

        // PASO 5: Operaciones con recursos protegidos
        console.log('Step 5: Protected Resources')
        const contactsResponse = await axios.get(`${API_BASE_URL}/contacts`, {
          headers: { Authorization: `Bearer ${userToken}` },
        })

        expect(contactsResponse.status).toBe(200)
        expect(Array.isArray(contactsResponse.data)).toBe(true)

        await delay(500)

        // PASO 6: Logout final
        console.log('Step 6: Final Logout')
        const logoutResponse = await axios.post(
          `${API_BASE_URL}/users/logout`,
          {},
          {
            headers: { Authorization: `Bearer ${userToken}` },
          }
        )

        expect(logoutResponse.status).toBe(200)

        await delay(500)

        // PASO 7: Verificar que el token se invalidó
        console.log('Step 7: Token Invalidation Verification')
        try {
          await axios.get(`${API_BASE_URL}/users/me`, {
            headers: { Authorization: `Bearer ${userToken}` },
          })
          fail('Token should be invalid after logout')
        } catch (error: any) {
          expect(error.response.status).toBe(401)
        }

        console.log('Complete user journey test passed! ✅')
      } catch (error: any) {
        console.error(
          'Complete user journey failed:',
          error.response?.data || error.message
        )
        throw error
      }
    })

    it('should handle user registration → contact management → logout flow', async () => {
      const testUser = generateTestUser()
      const testContact = generateTestContact()
      let userToken: string
      let createdContactId: string

      try {
        // PASO 1: Registro de usuario
        console.log('Step 1: User Registration for Contact Flow')
        const registrationResponse = await axios.post(
          `${API_BASE_URL}/users`,
          testUser
        )

        expect(registrationResponse.status).toBe(201)
        userToken = registrationResponse.data.token

        await delay(1000)

        // PASO 2: Crear contacto
        console.log('Step 2: Create Contact')
        const createContactResponse = await axios.post(
          `${API_BASE_URL}/contacts`,
          testContact,
          {
            headers: { Authorization: `Bearer ${userToken}` },
          }
        )

        expect(createContactResponse.status).toBe(201)
        expect(createContactResponse.data.firstName).toBe(testContact.firstName)
        expect(createContactResponse.data.email).toBe(testContact.email)

        createdContactId = createContactResponse.data._id

        await delay(500)

        // PASO 3: Listar contactos
        console.log('Step 3: List Contacts')
        const listContactsResponse = await axios.get(
          `${API_BASE_URL}/contacts`,
          {
            headers: { Authorization: `Bearer ${userToken}` },
          }
        )

        expect(listContactsResponse.status).toBe(200)
        expect(listContactsResponse.data).toContainEqual(
          expect.objectContaining({
            _id: createdContactId,
            firstName: testContact.firstName,
          })
        )

        await delay(500)

        // PASO 4: Obtener contacto específico
        console.log('Step 4: Get Specific Contact')
        const getContactResponse = await axios.get(
          `${API_BASE_URL}/contacts/${createdContactId}`,
          {
            headers: { Authorization: `Bearer ${userToken}` },
          }
        )

        expect(getContactResponse.status).toBe(200)
        expect(getContactResponse.data._id).toBe(createdContactId)
        expect(getContactResponse.data.email).toBe(testContact.email)

        await delay(500)

        // PASO 5: Actualizar contacto
        console.log('Step 5: Update Contact')
        const updatedContact = { ...testContact, phone: '8005551234' }
        const updateContactResponse = await axios.put(
          `${API_BASE_URL}/contacts/${createdContactId}`,
          updatedContact,
          {
            headers: { Authorization: `Bearer ${userToken}` },
          }
        )

        expect(updateContactResponse.status).toBe(200)
        expect(updateContactResponse.data.phone).toBe('8005551234')

        await delay(500)

        // PASO 6: Eliminar contacto
        console.log('Step 6: Delete Contact')
        const deleteContactResponse = await axios.delete(
          `${API_BASE_URL}/contacts/${createdContactId}`,
          {
            headers: { Authorization: `Bearer ${userToken}` },
          }
        )

        expect(deleteContactResponse.status).toBe(200)

        await delay(500)

        // PASO 7: Verificar que el contacto se eliminó
        console.log('Step 7: Verify Contact Deletion')
        try {
          await axios.get(`${API_BASE_URL}/contacts/${createdContactId}`, {
            headers: { Authorization: `Bearer ${userToken}` },
          })
          fail('Contact should not exist after deletion')
        } catch (error: any) {
          expect(error.response.status).toBe(404)
        }

        await delay(500)

        // PASO 8: Logout
        console.log('Step 8: Final Logout')
        const logoutResponse = await axios.post(
          `${API_BASE_URL}/users/logout`,
          {},
          {
            headers: { Authorization: `Bearer ${userToken}` },
          }
        )

        expect(logoutResponse.status).toBe(200)

        console.log('Contact management flow test passed! ✅')
      } catch (error: any) {
        console.error(
          'Contact management flow failed:',
          error.response?.data || error.message
        )
        throw error
      }
    })
  })

  describe('Error Handling and Recovery', () => {
    it('should handle network interruptions gracefully', async () => {
      const testUser = generateTestUser()

      try {
        // Registro exitoso
        const registrationResponse = await axios.post(
          `${API_BASE_URL}/users`,
          testUser
        )
        expect(registrationResponse.status).toBe(201)

        const token = registrationResponse.data.token

        // Simular recuperación después de interrupción
        await delay(2000)

        // Verificar que la sesión sigue activa
        const recoveryResponse = await axios.get(`${API_BASE_URL}/users/me`, {
          headers: { Authorization: `Bearer ${token}` },
        })

        expect(recoveryResponse.status).toBe(200)
        expect(recoveryResponse.data.email).toBe(testUser.email)
      } catch (error: any) {
        throw new Error(
          `Network recovery test failed: ${
            error.response?.data?.message || error.message
          }`
        )
      }
    })

    it('should handle concurrent operations safely', async () => {
      const testUser = generateTestUser()

      try {
        // Registro
        const registrationResponse = await axios.post(
          `${API_BASE_URL}/users`,
          testUser
        )
        const token = registrationResponse.data.token

        await delay(1000)

        // Operaciones concurrentes
        const concurrentOperations = [
          axios.get(`${API_BASE_URL}/users/me`, {
            headers: { Authorization: `Bearer ${token}` },
          }),
          axios.get(`${API_BASE_URL}/contacts`, {
            headers: { Authorization: `Bearer ${token}` },
          }),
          axios.get(`${API_BASE_URL}/users/me`, {
            headers: { Authorization: `Bearer ${token}` },
          }),
        ]

        const results = await Promise.all(concurrentOperations)

        results.forEach((result) => {
          expect(result.status).toBe(200)
        })

        // Logout final
        await axios.post(
          `${API_BASE_URL}/users/logout`,
          {},
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        )
      } catch (error: any) {
        throw new Error(
          `Concurrent operations test failed: ${
            error.response?.data?.message || error.message
          }`
        )
      }
    })
  })
})
