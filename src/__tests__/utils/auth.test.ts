import { PasswordUtils, TokenUtils, ValidationUtils } from '../../utils/auth'

describe('PasswordUtils', () => {
  describe('validatePassword', () => {
    test('should validate password with all requirements', () => {
      const result = PasswordUtils.validatePassword('Password123!')
      expect(result.isValid).toBe(true)
      expect(result.errors).toHaveLength(0)
    })

    test('should reject password too short', () => {
      const result = PasswordUtils.validatePassword('Pass1!')
      expect(result.isValid).toBe(false)
      expect(result.errors).toContain(
        'La contraseña debe tener al menos 8 caracteres'
      )
    })

    test('should reject password without letters', () => {
      const result = PasswordUtils.validatePassword('12345678!')
      expect(result.isValid).toBe(false)
      expect(result.errors).toContain(
        'La contraseña debe contener al menos una letra'
      )
    })

    test('should reject password without numbers', () => {
      const result = PasswordUtils.validatePassword('Password!')
      expect(result.isValid).toBe(false)
      expect(result.errors).toContain(
        'La contraseña debe contener al menos un número'
      )
    })

    test('should reject password without special characters', () => {
      const result = PasswordUtils.validatePassword('Password123')
      expect(result.isValid).toBe(false)
      expect(result.errors).toContain(
        'La contraseña debe contener al menos un carácter especial'
      )
    })

    test('should return multiple errors for invalid password', () => {
      const result = PasswordUtils.validatePassword('pass')
      expect(result.isValid).toBe(false)
      expect(result.errors.length).toBeGreaterThan(1)
    })
  })

  describe('hashPassword and comparePassword', () => {
    test('should hash password and verify correctly', async () => {
      const password = 'TestPassword123!'
      const hash = await PasswordUtils.hashPassword(password)

      expect(hash).toBeDefined()
      expect(hash).not.toBe(password)
      expect(hash.length).toBeGreaterThan(50)

      const isValid = await PasswordUtils.comparePassword(password, hash)
      expect(isValid).toBe(true)
    })

    test('should reject wrong password', async () => {
      const password = 'TestPassword123!'
      const wrongPassword = 'WrongPassword123!'
      const hash = await PasswordUtils.hashPassword(password)

      const isValid = await PasswordUtils.comparePassword(wrongPassword, hash)
      expect(isValid).toBe(false)
    })

    test('should generate different hashes for same password', async () => {
      const password = 'TestPassword123!'
      const hash1 = await PasswordUtils.hashPassword(password)
      const hash2 = await PasswordUtils.hashPassword(password)

      expect(hash1).not.toBe(hash2)

      // Pero ambos deben validar correctamente
      expect(await PasswordUtils.comparePassword(password, hash1)).toBe(true)
      expect(await PasswordUtils.comparePassword(password, hash2)).toBe(true)
    })
  })
})

describe('TokenUtils', () => {
  describe('generateJWT and verifyJWT', () => {
    test('should generate and verify JWT token', () => {
      const payload = { id: '123', email: 'test@example.com' }
      const token = TokenUtils.generateJWT(payload, '1h')

      expect(token).toBeDefined()
      expect(typeof token).toBe('string')
      expect(token.split('.')).toHaveLength(3) // JWT tiene 3 partes

      const decoded = TokenUtils.verifyJWT(token)
      expect(decoded.id).toBe(payload.id)
      expect(decoded.email).toBe(payload.email)
    })

    test('should throw error for invalid token', () => {
      expect(() => {
        TokenUtils.verifyJWT('invalid.token.here')
      }).toThrow()
    })

    test('should throw error for malformed token', () => {
      expect(() => {
        TokenUtils.verifyJWT('not-a-jwt-token')
      }).toThrow()
    })
  })

  describe('generateEmailVerificationToken', () => {
    test('should generate unique verification tokens', () => {
      const token1 = TokenUtils.generateEmailVerificationToken()
      const token2 = TokenUtils.generateEmailVerificationToken()

      expect(token1).toBeDefined()
      expect(token2).toBeDefined()
      expect(token1).not.toBe(token2)
      expect(typeof token1).toBe('string')
      expect(token1.length).toBeGreaterThan(20)
    })
  })
})

describe('ValidationUtils', () => {
  describe('validateEmail', () => {
    test('should validate correct email formats', () => {
      const validEmails = [
        'test@example.com',
        'user.name@domain.co.uk',
        'user+tag@example.org',
        'user123@test-domain.com',
      ]

      validEmails.forEach((email) => {
        expect(ValidationUtils.validateEmail(email)).toBe(true)
      })
    })

    test('should reject invalid email formats', () => {
      const invalidEmails = [
        'notanemail',
        '@example.com',
        'test@',
        'test@.',
        'test@.com',
        'test@example',
        '',
        'test @example.com',
      ]

      invalidEmails.forEach((email) => {
        expect(ValidationUtils.validateEmail(email)).toBe(false)
      })
    })
  })

  describe('sanitizeString', () => {
    test('should remove dangerous characters', () => {
      expect(
        ValidationUtils.sanitizeString('Hello<script>alert("xss")</script>')
      ).toBe('Helloalert("xss")')
      expect(ValidationUtils.sanitizeString('Normal text')).toBe('Normal text')
      expect(ValidationUtils.sanitizeString('  spaced text  ')).toBe(
        'spaced text'
      )
      expect(ValidationUtils.sanitizeString('<>')).toBe('')
    })

    test('should trim whitespace', () => {
      expect(ValidationUtils.sanitizeString('  hello world  ')).toBe(
        'hello world'
      )
      expect(ValidationUtils.sanitizeString('\n\ttest\n\t')).toBe('test')
    })
  })
})
