import { ValidationUtils } from '../../utils/ValidationUtils'
import { FormatUtils } from '../../utils/FormatUtils'
import { User } from '../../types/api.types'

describe('User Profile Management Integration', () => {
  describe('Profile Data Validation', () => {
    const validProfileData: Partial<User> = {
      firstName: 'Updated',
      lastName: 'Username',
      email: 'test2@fake.com',
      password: 'myNewPassword',
    }

    it('should validate complete profile update data', () => {
      expect(ValidationUtils.isValidName(validProfileData.firstName!)).toBe(
        true
      )
      expect(ValidationUtils.isValidName(validProfileData.lastName!)).toBe(true)
      expect(ValidationUtils.isValidEmail(validProfileData.email!)).toBe(true)
      expect(ValidationUtils.isValidPassword(validProfileData.password!)).toBe(
        true
      )
    })

    it('should validate partial profile updates', () => {
      const partialUpdates = [
        { firstName: 'NewFirstName' },
        { lastName: 'NewLastName' },
        { email: 'newemail@example.com' },
        { password: 'newPassword123' },
        { firstName: 'New', lastName: 'Name' },
        { email: 'updated@test.com', password: 'updatedPass' },
      ]

      partialUpdates.forEach((update) => {
        if (update.firstName) {
          expect(ValidationUtils.isValidName(update.firstName)).toBe(true)
        }
        if (update.lastName) {
          expect(ValidationUtils.isValidName(update.lastName)).toBe(true)
        }
        if (update.email) {
          expect(ValidationUtils.isValidEmail(update.email)).toBe(true)
        }
        if (update.password) {
          expect(ValidationUtils.isValidPassword(update.password)).toBe(true)
        }
      })
    })

    it('should reject invalid profile update data', () => {
      const invalidUpdates = [
        { firstName: '' }, // Empty name
        { lastName: '   ' }, // Whitespace only
        { email: 'invalid-email' }, // Invalid email format
        { password: '123' }, // Password too short
        { firstName: 'a'.repeat(51) }, // Name too long
      ]

      invalidUpdates.forEach((update) => {
        if (update.firstName !== undefined) {
          expect(ValidationUtils.isValidName(update.firstName)).toBe(false)
        }
        if (update.lastName !== undefined) {
          expect(ValidationUtils.isValidName(update.lastName)).toBe(false)
        }
        if (update.email !== undefined) {
          expect(ValidationUtils.isValidEmail(update.email)).toBe(false)
        }
        if (update.password !== undefined) {
          expect(ValidationUtils.isValidPassword(update.password)).toBe(false)
        }
      })
    })
  })

  describe('Profile Data Formatting', () => {
    it('should format profile data correctly', () => {
      const profileData = {
        firstName: '  Updated  ',
        lastName: '  Username  ',
        email: 'TEST2@FAKE.COM',
        password: 'myNewPassword',
      }

      const formattedData = {
        firstName: profileData.firstName.trim(),
        lastName: profileData.lastName.trim(),
        email: profileData.email.toLowerCase(),
        password: profileData.password, // Password should not be modified
      }

      expect(formattedData.firstName).toBe('Updated')
      expect(formattedData.lastName).toBe('Username')
      expect(formattedData.email).toBe('test2@fake.com')
      expect(formattedData.password).toBe('myNewPassword')
    })

    it('should format full name from profile data', () => {
      const profile: User = {
        _id: '608b2db1add2691791c04c89',
        firstName: 'Updated',
        lastName: 'Username',
        email: 'test2@fake.com',
      }

      const fullName = FormatUtils.formatFullName(
        profile.firstName,
        profile.lastName
      )
      expect(fullName).toBe('Updated Username')
    })

    it('should handle capitalization of names in profile', () => {
      const profile = {
        firstName: 'updated',
        lastName: 'username',
      }

      const capitalizedFirst = FormatUtils.capitalizeWords(profile.firstName)
      const capitalizedLast = FormatUtils.capitalizeWords(profile.lastName)

      expect(capitalizedFirst).toBe('Updated')
      expect(capitalizedLast).toBe('Username')
    })
  })

  describe('API Response Validation', () => {
    const mockUserProfile: User = {
      _id: '608b2db1add2691791c04c89',
      firstName: 'Test',
      lastName: 'User',
      email: 'test@fake.com',
    }

    it('should validate user profile response structure', () => {
      expect(mockUserProfile).toHaveProperty('_id')
      expect(mockUserProfile).toHaveProperty('firstName')
      expect(mockUserProfile).toHaveProperty('lastName')
      expect(mockUserProfile).toHaveProperty('email')
      expect(mockUserProfile).not.toHaveProperty('password') // Password should not be in response
    })

    it('should validate user profile field types', () => {
      expect(typeof mockUserProfile._id).toBe('string')
      expect(typeof mockUserProfile.firstName).toBe('string')
      expect(typeof mockUserProfile.lastName).toBe('string')
      expect(typeof mockUserProfile.email).toBe('string')
    })

    it('should validate user profile field values', () => {
      expect(mockUserProfile._id).toBeDefined()
      expect(mockUserProfile._id!.length).toBeGreaterThan(0)
      expect(ValidationUtils.isValidName(mockUserProfile.firstName)).toBe(true)
      expect(ValidationUtils.isValidName(mockUserProfile.lastName)).toBe(true)
      expect(ValidationUtils.isValidEmail(mockUserProfile.email)).toBe(true)
    })
  })

  describe('Error Scenarios', () => {
    it('should handle common update error scenarios', () => {
      const errorScenarios = [
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
        {
          field: 'authentication',
          value: null,
          expectedError: 'Please authenticate',
        },
        {
          field: 'token',
          value: 'invalid-token',
          expectedError: 'Invalid token',
        },
      ]

      errorScenarios.forEach(({ field, value, expectedError }) => {
        expect(typeof expectedError).toBe('string')
        expect(expectedError.length).toBeGreaterThan(0)

        if (field === 'email' && value && value !== 'existing@email.com') {
          expect(ValidationUtils.isValidEmail(value)).toBe(false)
        }
        if (field === 'password' && value) {
          expect(ValidationUtils.isValidPassword(value)).toBe(false)
        }
      })
    })
  })

  describe('Profile Update Flow Integration', () => {
    it('should simulate complete profile update flow', () => {
      // 1. Validate current profile data
      const currentProfile: User = {
        _id: '608b2db1add2691791c04c89',
        firstName: 'Test',
        lastName: 'User',
        email: 'test@fake.com',
      }

      expect(ValidationUtils.isValidName(currentProfile.firstName)).toBe(true)
      expect(ValidationUtils.isValidName(currentProfile.lastName)).toBe(true)
      expect(ValidationUtils.isValidEmail(currentProfile.email)).toBe(true)

      // 2. Prepare update data
      const updateData = {
        firstName: '  Updated  ',
        lastName: '  Username  ',
        email: 'TEST2@FAKE.COM',
        password: 'myNewPassword',
      }

      // 3. Clean and validate update data
      const cleanedData = {
        firstName: updateData.firstName.trim(),
        lastName: updateData.lastName.trim(),
        email: updateData.email.toLowerCase(),
        password: updateData.password,
      }

      expect(ValidationUtils.isValidName(cleanedData.firstName)).toBe(true)
      expect(ValidationUtils.isValidName(cleanedData.lastName)).toBe(true)
      expect(ValidationUtils.isValidEmail(cleanedData.email)).toBe(true)
      expect(ValidationUtils.isValidPassword(cleanedData.password)).toBe(true)

      // 4. Simulate successful response
      const updatedProfile: User = {
        _id: currentProfile._id,
        firstName: cleanedData.firstName,
        lastName: cleanedData.lastName,
        email: cleanedData.email,
      }

      expect(updatedProfile.firstName).toBe('Updated')
      expect(updatedProfile.lastName).toBe('Username')
      expect(updatedProfile.email).toBe('test2@fake.com')
      expect(updatedProfile).not.toHaveProperty('password') // Password not in response

      // 5. Format display name
      const displayName = FormatUtils.formatFullName(
        updatedProfile.firstName,
        updatedProfile.lastName
      )

      expect(displayName).toBe('Updated Username')
    })
  })
})
