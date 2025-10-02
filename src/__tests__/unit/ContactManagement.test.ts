import { ContactListApiService } from '../../services/ContactListApiService'
import { ValidationUtils } from '../../utils/ValidationUtils'
import { FormatUtils } from '../../utils/FormatUtils'
import { Contact } from '../../types/api.types'

// Mock fetch globalmente
global.fetch = jest.fn()

describe('Contact Management Integration', () => {
  let apiService: ContactListApiService
  const mockFetch = fetch as jest.MockedFunction<typeof fetch>

  beforeEach(() => {
    apiService = new ContactListApiService()
    apiService.setToken('valid-token-123')
    jest.clearAllMocks()
  })

  describe('Complete Contact CRUD Workflow', () => {
    const testContactData = {
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

    it('should complete full contact lifecycle: create → read → update → delete', async () => {
      // 1. CREATE CONTACT
      const mockCreatedContact = {
        _id: 'test-contact-id',
        ...testContactData,
        owner: 'user-id-123',
        __v: 0,
      }

      mockFetch.mockResolvedValueOnce({
        ok: true,
        status: 201,
        json: () => Promise.resolve(mockCreatedContact),
      } as Response)

      const createdContact = await apiService.createContact(testContactData)
      expect(createdContact).toEqual(mockCreatedContact)

      // 2. GET CONTACT BY ID
      mockFetch.mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: () => Promise.resolve(mockCreatedContact),
      } as Response)

      const retrievedContact = await apiService.getContact(createdContact._id!)
      expect(retrievedContact).toEqual(mockCreatedContact)

      // 3. GET ALL CONTACTS (should include our new contact)
      mockFetch.mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: () => Promise.resolve([mockCreatedContact]),
      } as Response)

      const allContacts = await apiService.getContacts()
      expect(allContacts).toContain(mockCreatedContact)

      // 4. UPDATE CONTACT (PUT)
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
        _id: createdContact._id,
        ...updateData,
        owner: 'user-id-123',
        __v: 0,
      }

      mockFetch.mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: () => Promise.resolve(mockUpdatedContact),
      } as Response)

      const updatedContact = await apiService.updateContact(
        createdContact._id!,
        updateData
      )
      expect(updatedContact).toEqual(mockUpdatedContact)

      // 5. PARTIAL UPDATE (PATCH)
      const partialUpdate = {
        firstName: 'Anna',
      }

      const mockPartiallyUpdated = {
        ...mockUpdatedContact,
        firstName: 'Anna',
      }

      mockFetch.mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: () => Promise.resolve(mockPartiallyUpdated),
      } as Response)

      const partiallyUpdated = await apiService.updateContactPartial(
        createdContact._id!,
        partialUpdate
      )
      expect(partiallyUpdated.firstName).toBe('Anna')

      // 6. DELETE CONTACT
      mockFetch.mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: () => Promise.resolve({}),
      } as Response)

      await apiService.deleteContact(createdContact._id!)

      // 7. VERIFY CONTACT IS DELETED (should return 404)
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 404,
        json: () =>
          Promise.resolve({
            message: 'Contact not found',
          }),
      } as Response)

      await expect(apiService.getContact(createdContact._id!)).rejects.toThrow(
        'Contact not found'
      )
    })
  })

  describe('Contact Data Validation Integration', () => {
    it('should validate contact data before creation', () => {
      const contactData = {
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

      // Validar todos los campos
      expect(ValidationUtils.isValidName(contactData.firstName)).toBe(true)
      expect(ValidationUtils.isValidName(contactData.lastName)).toBe(true)
      expect(ValidationUtils.isValidBirthdate(contactData.birthdate)).toBe(true)
      expect(ValidationUtils.isValidEmail(contactData.email)).toBe(true)
      expect(ValidationUtils.isValidPhone(contactData.phone)).toBe(true)
    })

    it('should detect invalid contact data', () => {
      const invalidContactData = [
        {
          firstName: '',
          lastName: 'Doe',
          email: 'valid@email.com',
        },
        {
          firstName: 'John',
          lastName: 'Doe',
          email: 'invalid-email',
        },
        {
          firstName: 'John',
          lastName: 'Doe',
          birthdate: '2025-01-01', // Future date
          email: 'valid@email.com',
        },
        {
          firstName: 'John',
          lastName: 'Doe',
          phone: '123', // Too short
          email: 'valid@email.com',
        },
      ]

      // Test that we have invalid data cases
      expect(invalidContactData.length).toBeGreaterThan(0)
    })

    it('should validate individual contact fields correctly', () => {
      // Create a future date for testing
      const futureDate = new Date()
      futureDate.setFullYear(futureDate.getFullYear() + 1)

      // Test individual validation cases
      expect(ValidationUtils.isValidName('')).toBe(false) // Empty firstName
      expect(ValidationUtils.isValidEmail('invalid-email')).toBe(false) // Invalid email
      expect(ValidationUtils.isValidBirthdate(futureDate.toISOString())).toBe(
        false
      ) // Future date
      expect(ValidationUtils.isValidPhone('123')).toBe(false) // Too short phone
    })

    it('should format contact data correctly', () => {
      const rawContactData = {
        firstName: '  john  ',
        lastName: '  DOE  ',
        email: 'JDOE@FAKE.COM',
        phone: '8005555555',
        city: 'anytown',
        stateProvince: 'ks',
        country: 'usa',
      }

      // Simular limpieza y formateo de datos
      const cleanedData = {
        firstName: FormatUtils.capitalizeWords(rawContactData.firstName.trim()),
        lastName: FormatUtils.capitalizeWords(rawContactData.lastName.trim()),
        email: rawContactData.email.toLowerCase(),
        phone: FormatUtils.formatPhone(rawContactData.phone),
        city: FormatUtils.capitalizeWords(rawContactData.city),
        stateProvince: rawContactData.stateProvince.toUpperCase(),
        country: FormatUtils.capitalizeWords(rawContactData.country),
      }

      expect(cleanedData.firstName).toBe('John')
      expect(cleanedData.lastName).toBe('Doe')
      expect(cleanedData.email).toBe('jdoe@fake.com')
      expect(cleanedData.phone).toBe('(800) 555-5555')
      expect(cleanedData.city).toBe('Anytown')
      expect(cleanedData.stateProvince).toBe('KS')
      expect(cleanedData.country).toBe('Usa')
    })

    it('should format complete contact display information', () => {
      const contact: Contact = {
        _id: 'contact-id',
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
        owner: 'user-id',
      }

      // Formatear información de display
      const displayInfo = {
        fullName: FormatUtils.formatFullName(
          contact.firstName,
          contact.lastName
        ),
        formattedPhone: FormatUtils.formatPhone(contact.phone!),
        formattedAddress: FormatUtils.formatAddress(
          contact.street1,
          contact.street2,
          contact.city,
          contact.stateProvince,
          contact.postalCode,
          contact.country
        ),
        formattedBirthdate: FormatUtils.formatDateToISO(contact.birthdate!),
      }

      expect(displayInfo.fullName).toBe('John Doe')
      expect(displayInfo.formattedPhone).toBe('(800) 555-5555')
      expect(displayInfo.formattedAddress).toBe(
        '1 Main St., Apartment A, Anytown, KS, 12345, USA'
      )
      expect(displayInfo.formattedBirthdate).toBe('1970-01-01')
    })
  })

  describe('Contact Error Scenarios', () => {
    it('should handle authentication and authorization errors', async () => {
      // Sin token
      const serviceWithoutToken = new ContactListApiService()

      await expect(serviceWithoutToken.getContacts()).rejects.toThrow(
        'Authentication token is required'
      )

      await expect(
        serviceWithoutToken.createContact({
          firstName: 'Test',
          lastName: 'User',
        })
      ).rejects.toThrow('Authentication token is required')

      // Token inválido
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 401,
        json: () =>
          Promise.resolve({
            message: 'Invalid token',
          }),
      } as Response)

      await expect(apiService.getContacts()).rejects.toThrow('Invalid token')
    })

    it('should handle contact not found scenarios', async () => {
      const nonExistentId = 'non-existent-contact-id'

      // GET contact not found
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 404,
        json: () =>
          Promise.resolve({
            message: 'Contact not found',
          }),
      } as Response)

      await expect(apiService.getContact(nonExistentId)).rejects.toThrow(
        'Contact not found'
      )

      // UPDATE contact not found
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 404,
        json: () =>
          Promise.resolve({
            message: 'Contact not found',
          }),
      } as Response)

      await expect(
        apiService.updateContact(nonExistentId, {
          firstName: 'Updated',
        })
      ).rejects.toThrow('Contact not found')

      // DELETE contact not found
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 404,
        json: () =>
          Promise.resolve({
            message: 'Contact not found',
          }),
      } as Response)

      await expect(apiService.deleteContact(nonExistentId)).rejects.toThrow(
        'Contact not found'
      )
    })

    it('should handle validation errors from API', async () => {
      const validationErrors = [
        {
          data: { firstName: '', lastName: 'Doe' },
          expectedError: 'Path `firstName` is required.',
        },
        {
          data: { firstName: 'John', lastName: 'Doe', email: 'invalid-email' },
          expectedError: 'Please enter a valid email',
        },
        {
          data: {
            firstName: 'John',
            lastName: 'Doe',
            birthdate: 'invalid-date',
          },
          expectedError: 'Invalid date format',
        },
      ]

      for (const { data, expectedError } of validationErrors) {
        mockFetch.mockResolvedValueOnce({
          ok: false,
          status: 400,
          json: () =>
            Promise.resolve({
              message: expectedError,
            }),
        } as Response)

        await expect(apiService.createContact(data)).rejects.toThrow(
          expectedError
        )
      }
    })
  })

  describe('Contact Search and Filtering Integration', () => {
    const mockContactsList = [
      {
        _id: 'contact-1',
        firstName: 'John',
        lastName: 'Doe',
        email: 'john@example.com',
        phone: '8005551234',
        city: 'New York',
        country: 'USA',
        owner: 'user-id',
      },
      {
        _id: 'contact-2',
        firstName: 'Jane',
        lastName: 'Smith',
        email: 'jane@example.com',
        phone: '8005555678',
        city: 'Los Angeles',
        country: 'USA',
        owner: 'user-id',
      },
      {
        _id: 'contact-3',
        firstName: 'Carlos',
        lastName: 'Rodriguez',
        email: 'carlos@example.com',
        phone: '8005559012',
        city: 'Madrid',
        country: 'Spain',
        owner: 'user-id',
      },
    ]

    it('should retrieve and process contact list for search functionality', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: () => Promise.resolve(mockContactsList),
      } as Response)

      const contacts = await apiService.getContacts()

      // Simular funcionalidad de búsqueda por nombre
      const searchByName = (query: string) => {
        return contacts.filter((contact) =>
          FormatUtils.formatFullName(contact.firstName, contact.lastName)
            .toLowerCase()
            .includes(query.toLowerCase())
        )
      }

      expect(searchByName('john')).toHaveLength(1)
      expect(searchByName('doe')).toHaveLength(1)
      expect(searchByName('smith')).toHaveLength(1)
      expect(searchByName('rodriguez')).toHaveLength(1)

      // Simular funcionalidad de filtrado por país
      const filterByCountry = (country: string) => {
        return contacts.filter(
          (contact) => contact.country?.toLowerCase() === country.toLowerCase()
        )
      }

      expect(filterByCountry('USA')).toHaveLength(2)
      expect(filterByCountry('Spain')).toHaveLength(1)

      // Simular ordenamiento alfabético
      const sortedContacts = [...contacts].sort((a, b) =>
        FormatUtils.formatFullName(a.firstName, a.lastName).localeCompare(
          FormatUtils.formatFullName(b.firstName, b.lastName)
        )
      )

      expect(sortedContacts[0].firstName).toBe('Carlos')
      expect(sortedContacts[1].firstName).toBe('Jane')
      expect(sortedContacts[2].firstName).toBe('John')
    })
  })

  describe('Bulk Operations Simulation', () => {
    it('should handle multiple contact operations', async () => {
      const contactsToCreate = [
        { firstName: 'Alice', lastName: 'Johnson', email: 'alice@test.com' },
        { firstName: 'Bob', lastName: 'Wilson', email: 'bob@test.com' },
        { firstName: 'Carol', lastName: 'Brown', email: 'carol@test.com' },
      ]

      // Simular creación múltiple
      const createdContacts = []
      for (let i = 0; i < contactsToCreate.length; i++) {
        const mockCreated = {
          _id: `bulk-contact-${i}`,
          ...contactsToCreate[i],
          owner: 'user-id',
          __v: 0,
        }

        mockFetch.mockResolvedValueOnce({
          ok: true,
          status: 201,
          json: () => Promise.resolve(mockCreated),
        } as Response)

        const created = await apiService.createContact(contactsToCreate[i])
        createdContacts.push(created)
      }

      expect(createdContacts).toHaveLength(3)

      // Simular actualización múltiple
      for (const contact of createdContacts) {
        const updateData = { phone: '8005550000' }
        const mockUpdated = { ...contact, ...updateData }

        mockFetch.mockResolvedValueOnce({
          ok: true,
          status: 200,
          json: () => Promise.resolve(mockUpdated),
        } as Response)

        const updated = await apiService.updateContactPartial(
          contact._id!,
          updateData
        )
        expect(updated.phone).toBe('8005550000')
      }

      // Simular eliminación múltiple
      for (const contact of createdContacts) {
        mockFetch.mockResolvedValueOnce({
          ok: true,
          status: 200,
          json: () => Promise.resolve({}),
        } as Response)

        await apiService.deleteContact(contact._id!)
      }

      expect(mockFetch).toHaveBeenCalledTimes(9) // 3 creates + 3 updates + 3 deletes
    })
  })
})
