import { ValidationUtils } from '../../utils/ValidationUtils'

describe('ValidationUtils', () => {
  describe('isValidEmail', () => {
    it('should return true for valid email addresses', () => {
      const validEmails = [
        'test@example.com',
        'user.name@domain.co.uk',
        'user+tag@example.org',
        'user123@test-domain.com',
      ]

      validEmails.forEach((email) => {
        expect(ValidationUtils.isValidEmail(email)).toBe(true)
      })
    })

    it('should return false for invalid email addresses', () => {
      const invalidEmails = [
        'invalid-email',
        '@example.com',
        'user@',
        'user.example.com',
        '',
        'user@.com',
        'user@domain.',
        'user name@example.com',
      ]

      invalidEmails.forEach((email) => {
        expect(ValidationUtils.isValidEmail(email)).toBe(false)
      })
    })
  })

  describe('isValidPassword', () => {
    it('should return true for passwords with 7 or more characters', () => {
      const validPasswords = [
        'password123',
        'mypassword',
        '1234567',
        'P@ssw0rd!',
      ]

      validPasswords.forEach((password) => {
        expect(ValidationUtils.isValidPassword(password)).toBe(true)
      })
    })

    it('should return false for passwords with less than 7 characters', () => {
      const invalidPasswords = ['pass', '123456', '', 'abc', '12345']

      invalidPasswords.forEach((password) => {
        expect(ValidationUtils.isValidPassword(password)).toBe(false)
      })
    })
  })

  describe('isValidName', () => {
    it('should return true for valid names', () => {
      const validNames = [
        'John',
        'María José',
        'Jean-Paul',
        "O'Connor",
        'José María de la Cruz',
      ]

      validNames.forEach((name) => {
        expect(ValidationUtils.isValidName(name)).toBe(true)
      })
    })

    it('should return false for invalid names', () => {
      const invalidNames = [
        '',
        '   ',
        'a'.repeat(51), // Más de 50 caracteres
      ]

      invalidNames.forEach((name) => {
        expect(ValidationUtils.isValidName(name)).toBe(false)
      })
    })
  })

  describe('isValidPhone', () => {
    it('should return true for valid phone numbers', () => {
      const validPhones = [
        '1234567890',
        '(123) 456-7890',
        '123-456-7890',
        '+1 123 456 7890',
        '123 456 7890',
      ]

      validPhones.forEach((phone) => {
        expect(ValidationUtils.isValidPhone(phone)).toBe(true)
      })
    })

    it('should return false for invalid phone numbers', () => {
      const invalidPhones = [
        '123abc',
        '123',
        '12345678901234567', // Muy largo
        '',
        'abcdefghij',
      ]

      invalidPhones.forEach((phone) => {
        expect(ValidationUtils.isValidPhone(phone)).toBe(false)
      })
    })
  })

  describe('isValidBirthdate', () => {
    it('should return true for valid birthdates', () => {
      const validDates = ['1990-01-01', '2000-12-31', '1950-06-15']

      validDates.forEach((date) => {
        expect(ValidationUtils.isValidBirthdate(date)).toBe(true)
      })
    })

    it('should return false for future dates', () => {
      const futureDate = new Date()
      futureDate.setFullYear(futureDate.getFullYear() + 1)

      expect(ValidationUtils.isValidBirthdate(futureDate.toISOString())).toBe(
        false
      )
    })

    it('should return false for dates too far in the past', () => {
      expect(ValidationUtils.isValidBirthdate('1900-01-01')).toBe(false)
    })

    it('should return false for invalid date formats', () => {
      const invalidDates = [
        'invalid-date',
        '2023-13-01', // Mes inválido
        '2023-01-32', // Día inválido
        '',
      ]

      invalidDates.forEach((date) => {
        expect(ValidationUtils.isValidBirthdate(date)).toBe(false)
      })
    })
  })

  describe('sanitizeString', () => {
    it('should remove dangerous characters', () => {
      expect(
        ValidationUtils.sanitizeString('<script>alert("xss")</script>')
      ).toBe('scriptalert(xss)/script')
      expect(ValidationUtils.sanitizeString('Hello "World"')).toBe(
        'Hello World'
      )
      expect(ValidationUtils.sanitizeString("It's a test")).toBe('Its a test')
    })

    it('should trim whitespace', () => {
      expect(ValidationUtils.sanitizeString('  hello world  ')).toBe(
        'hello world'
      )
    })

    it('should handle empty strings', () => {
      expect(ValidationUtils.sanitizeString('')).toBe('')
      expect(ValidationUtils.sanitizeString('   ')).toBe('')
    })
  })
})
