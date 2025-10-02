import { userModel } from '../../models/User'
import { User } from '../../types'

describe('UserModel', () => {
  beforeEach(async () => {
    await userModel.clear()
  })

  describe('create', () => {
    test('should create user successfully', async () => {
      const userData = {
        email: 'test@example.com',
        password: 'hashedpassword',
        isEmailVerified: false,
        emailVerificationToken: 'token123',
      }

      const user = await userModel.create(userData)

      expect(user.id).toBeDefined()
      expect(user.email).toBe(userData.email)
      expect(user.password).toBe(userData.password)
      expect(user.isEmailVerified).toBe(false)
      expect(user.emailVerificationToken).toBe(userData.emailVerificationToken)
      expect(user.createdAt).toBeInstanceOf(Date)
      expect(user.updatedAt).toBeInstanceOf(Date)
    })

    test('should generate unique IDs for different users', async () => {
      const userData1 = {
        email: 'test1@example.com',
        password: 'hashedpassword1',
        isEmailVerified: false,
      }

      const userData2 = {
        email: 'test2@example.com',
        password: 'hashedpassword2',
        isEmailVerified: false,
      }

      const user1 = await userModel.create(userData1)
      const user2 = await userModel.create(userData2)

      expect(user1.id).not.toBe(user2.id)
    })
  })

  describe('findByEmail', () => {
    test('should find user by email', async () => {
      const userData = {
        email: 'test@example.com',
        password: 'hashedpassword',
        isEmailVerified: false,
      }

      const createdUser = await userModel.create(userData)
      const foundUser = await userModel.findByEmail('test@example.com')

      expect(foundUser).toBeDefined()
      expect(foundUser?.id).toBe(createdUser.id)
      expect(foundUser?.email).toBe(userData.email)
    })

    test('should return null for non-existent email', async () => {
      const foundUser = await userModel.findByEmail('nonexistent@example.com')
      expect(foundUser).toBeNull()
    })

    test('should be case sensitive', async () => {
      const userData = {
        email: 'test@example.com',
        password: 'hashedpassword',
        isEmailVerified: false,
      }

      await userModel.create(userData)
      const foundUser = await userModel.findByEmail('TEST@EXAMPLE.COM')
      expect(foundUser).toBeNull()
    })
  })

  describe('findById', () => {
    test('should find user by id', async () => {
      const userData = {
        email: 'test@example.com',
        password: 'hashedpassword',
        isEmailVerified: false,
      }

      const createdUser = await userModel.create(userData)
      const foundUser = await userModel.findById(createdUser.id)

      expect(foundUser).toBeDefined()
      expect(foundUser?.id).toBe(createdUser.id)
      expect(foundUser?.email).toBe(userData.email)
    })

    test('should return null for non-existent id', async () => {
      const foundUser = await userModel.findById('nonexistent-id')
      expect(foundUser).toBeNull()
    })
  })

  describe('update', () => {
    test('should update user successfully', async () => {
      const userData = {
        email: 'test@example.com',
        password: 'hashedpassword',
        isEmailVerified: false,
        emailVerificationToken: 'token123',
      }

      const createdUser = await userModel.create(userData)
      const updates = {
        isEmailVerified: true,
        emailVerificationToken: undefined,
      }

      const updatedUser = await userModel.update(createdUser.id, updates)

      expect(updatedUser).toBeDefined()
      expect(updatedUser?.isEmailVerified).toBe(true)
      expect(updatedUser?.emailVerificationToken).toBeUndefined()
      expect(updatedUser?.updatedAt.getTime()).toBeGreaterThan(
        createdUser.updatedAt.getTime()
      )
    })

    test('should return null for non-existent user', async () => {
      const updatedUser = await userModel.update('nonexistent-id', {
        isEmailVerified: true,
      })
      expect(updatedUser).toBeNull()
    })

    test('should preserve unchanged fields', async () => {
      const userData = {
        email: 'test@example.com',
        password: 'hashedpassword',
        isEmailVerified: false,
        emailVerificationToken: 'token123',
      }

      const createdUser = await userModel.create(userData)
      const updatedUser = await userModel.update(createdUser.id, {
        isEmailVerified: true,
      })

      expect(updatedUser?.email).toBe(userData.email)
      expect(updatedUser?.password).toBe(userData.password)
      expect(updatedUser?.emailVerificationToken).toBe(
        userData.emailVerificationToken
      )
    })
  })

  describe('verifyEmail', () => {
    test('should verify email with valid token', async () => {
      const userData = {
        email: 'test@example.com',
        password: 'hashedpassword',
        isEmailVerified: false,
        emailVerificationToken: 'token123',
      }

      await userModel.create(userData)
      const verifiedUser = await userModel.verifyEmail('token123')

      expect(verifiedUser).toBeDefined()
      expect(verifiedUser?.isEmailVerified).toBe(true)
      expect(verifiedUser?.emailVerificationToken).toBeUndefined()
    })

    test('should return null for invalid token', async () => {
      const userData = {
        email: 'test@example.com',
        password: 'hashedpassword',
        isEmailVerified: false,
        emailVerificationToken: 'token123',
      }

      await userModel.create(userData)
      const verifiedUser = await userModel.verifyEmail('invalid-token')
      expect(verifiedUser).toBeNull()
    })

    test('should return null for already used token', async () => {
      const userData = {
        email: 'test@example.com',
        password: 'hashedpassword',
        isEmailVerified: false,
        emailVerificationToken: 'token123',
      }

      await userModel.create(userData)

      // Primera verificación
      const firstVerification = await userModel.verifyEmail('token123')
      expect(firstVerification).toBeDefined()

      // Segunda verificación con el mismo token
      const secondVerification = await userModel.verifyEmail('token123')
      expect(secondVerification).toBeNull()
    })
  })

  describe('findAll', () => {
    test('should return all users', async () => {
      const userData1 = {
        email: 'test1@example.com',
        password: 'hashedpassword1',
        isEmailVerified: false,
      }

      const userData2 = {
        email: 'test2@example.com',
        password: 'hashedpassword2',
        isEmailVerified: true,
      }

      await userModel.create(userData1)
      await userModel.create(userData2)

      const allUsers = await userModel.findAll()
      expect(allUsers).toHaveLength(2)
      expect(allUsers.map((u) => u.email)).toContain('test1@example.com')
      expect(allUsers.map((u) => u.email)).toContain('test2@example.com')
    })

    test('should return empty array when no users', async () => {
      const allUsers = await userModel.findAll()
      expect(allUsers).toHaveLength(0)
    })
  })
})
