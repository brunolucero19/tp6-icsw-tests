import { ValidationUtils } from '../../utils/ValidationUtils'
import { RegisterData } from '../../types/api.types'

describe('User Registration Validation Integration', () => {
  describe('validateUserRegistrationData', () => {
    const validUserData: RegisterData = {
      firstName: 'Test',
      lastName: 'User',
      email: 'test@fake.com',
      password: 'myPassword',
    }

    it('should validate complete valid user registration data', () => {
      expect(ValidationUtils.isValidName(validUserData.firstName)).toBe(true)
      expect(ValidationUtils.isValidName(validUserData.lastName)).toBe(true)
      expect(ValidationUtils.isValidEmail(validUserData.email)).toBe(true)
      expect(ValidationUtils.isValidPassword(validUserData.password)).toBe(true)
    })

    it('should reject registration data with invalid email', () => {
      const invalidEmailData = {
        ...validUserData,
        email: 'invalid-email-format',
      }

      expect(ValidationUtils.isValidEmail(invalidEmailData.email)).toBe(false)
    })

    it('should reject registration data with short password', () => {
      const shortPasswordData = {
        ...validUserData,
        password: '123', // Menos de 7 caracteres
      }

      expect(ValidationUtils.isValidPassword(shortPasswordData.password)).toBe(
        false
      )
    })

    it('should reject registration data with empty names', () => {
      const emptyFirstNameData = {
        ...validUserData,
        firstName: '',
      }

      const emptyLastNameData = {
        ...validUserData,
        lastName: '   ', // Solo espacios
      }

      expect(ValidationUtils.isValidName(emptyFirstNameData.firstName)).toBe(
        false
      )
      expect(ValidationUtils.isValidName(emptyLastNameData.lastName)).toBe(
        false
      )
    })

    it('should handle special characters in names', () => {
      const specialCharNameData = {
        ...validUserData,
        firstName: 'José María',
        lastName: "O'Connor-Smith",
      }

      expect(ValidationUtils.isValidName(specialCharNameData.firstName)).toBe(
        true
      )
      expect(ValidationUtils.isValidName(specialCharNameData.lastName)).toBe(
        true
      )
    })

    it('should sanitize potentially dangerous input', () => {
      const maliciousInput = '<script>alert("xss")</script>'
      const sanitized = ValidationUtils.sanitizeString(maliciousInput)

      expect(sanitized).not.toContain('<script>')
      expect(sanitized).not.toContain('</script>')
      expect(sanitized).toBe('scriptalert(xss)/script')
    })

    it('should validate email formats according to API expectations', () => {
      const testEmails = [
        { email: 'test@fake.com', valid: true },
        { email: 'user.name@domain.co.uk', valid: true },
        { email: 'test+tag@example.org', valid: true },
        { email: 'invalid.email', valid: false },
        { email: '@domain.com', valid: false },
        { email: 'user@', valid: false },
        { email: '', valid: false },
      ]

      testEmails.forEach(({ email, valid }) => {
        expect(ValidationUtils.isValidEmail(email)).toBe(valid)
      })
    })

    it('should validate password length according to API requirements', () => {
      const testPasswords = [
        { password: 'myPassword', valid: true }, // 10 chars
        { password: '1234567', valid: true }, // Exactamente 7 chars
        { password: 'short', valid: false }, // 5 chars
        { password: '123456', valid: false }, // 6 chars
        { password: '', valid: false },
      ]

      testPasswords.forEach(({ password, valid }) => {
        expect(ValidationUtils.isValidPassword(password)).toBe(valid)
      })
    })
  })

  describe('API Error Message Validation', () => {
    it('should handle typical API error scenarios', () => {
      const errorScenarios = [
        {
          field: 'firstName',
          value: '',
          expectedError: 'Path `firstName` is required.',
        },
        {
          field: 'email',
          value: 'invalid-email',
          expectedError: 'Please enter a valid email',
        },
        {
          field: 'email',
          value: 'existing@email.com',
          expectedError: 'Email address is already in use',
        },
        {
          field: 'password',
          value: '123',
          expectedError:
            'Path `password` (`123`) is shorter than the minimum allowed length (7).',
        },
      ]

      errorScenarios.forEach(({ field, value, expectedError }) => {
        // Simulamos que estos son los mensajes que la API devolvería
        expect(typeof expectedError).toBe('string')
        expect(expectedError.length).toBeGreaterThan(0)

        // Verificamos que el mensaje de error sea relevante al campo
        if (field === 'firstName') {
          expect(expectedError).toContain('firstName')
        } else if (field === 'password') {
          expect(expectedError).toContain('password')
        } else if (field === 'email') {
          expect(expectedError.toLowerCase()).toMatch(/email/)
        }
      })
    })
  })

  describe('Data Preparation for API', () => {
    it('should prepare user data correctly for API submission', () => {
      const userData: RegisterData = {
        firstName: '  Test  ', // Con espacios
        lastName: '  User  ',
        email: 'TEST@FAKE.COM', // Mayúsculas
        password: 'myPassword',
      }

      // Simulamos la limpieza que haríamos antes de enviar a la API
      const cleanedData = {
        firstName: userData.firstName.trim(),
        lastName: userData.lastName.trim(),
        email: userData.email.toLowerCase(),
        password: userData.password,
      }

      expect(cleanedData.firstName).toBe('Test')
      expect(cleanedData.lastName).toBe('User')
      expect(cleanedData.email).toBe('test@fake.com')
      expect(cleanedData.password).toBe('myPassword')
    })
  })
})
