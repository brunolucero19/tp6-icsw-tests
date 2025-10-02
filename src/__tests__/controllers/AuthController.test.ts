import request from 'supertest'
import app from '../../index'
import { userModel } from '../../models/User'
import { TokenUtils, PasswordUtils } from '../../utils/auth'

describe('AuthController', () => {
  beforeEach(async () => {
    await userModel.clear()
  })

  describe('POST /api/auth/register', () => {
    test('should register user successfully', async () => {
      const userData = {
        email: 'test@example.com',
        password: 'Password123!',
        confirmPassword: 'Password123!',
      }

      const response = await request(app)
        .post('/api/auth/register')
        .send(userData)
        .expect(201)

      expect(response.body.message).toContain('Usuario registrado exitosamente')
      expect(response.body.user.email).toBe(userData.email)
      expect(response.body.user.isEmailVerified).toBe(false)
      expect(response.body.user.id).toBeDefined()
    })

    test('should reject registration with existing email', async () => {
      const userData = {
        email: 'test@example.com',
        password: 'Password123!',
        confirmPassword: 'Password123!',
      }

      // Primer registro
      await request(app).post('/api/auth/register').send(userData)

      // Segundo registro con mismo email
      const response = await request(app)
        .post('/api/auth/register')
        .send(userData)
        .expect(400)

      expect(response.body.error).toBe('El usuario ya existe')
    })

    test('should reject registration with invalid email', async () => {
      const userData = {
        email: 'invalid-email',
        password: 'Password123!',
        confirmPassword: 'Password123!',
      }

      const response = await request(app)
        .post('/api/auth/register')
        .send(userData)
        .expect(400)

      expect(response.body.error).toBe('Datos de entrada inválidos')
      expect(response.body.details).toBeDefined()
    })

    test('should reject registration with weak password', async () => {
      const userData = {
        email: 'test@example.com',
        password: 'weak',
        confirmPassword: 'weak',
      }

      const response = await request(app)
        .post('/api/auth/register')
        .send(userData)
        .expect(400)

      expect(response.body.error).toBe('Datos de entrada inválidos')
    })

    test('should reject registration when passwords do not match', async () => {
      const userData = {
        email: 'test@example.com',
        password: 'Password123!',
        confirmPassword: 'DifferentPassword123!',
      }

      const response = await request(app)
        .post('/api/auth/register')
        .send(userData)
        .expect(400)

      expect(response.body.error).toBe('Datos de entrada inválidos')
    })

    test('should reject registration with missing fields', async () => {
      const userData = {
        email: 'test@example.com',
        // password missing
        confirmPassword: 'Password123!',
      }

      const response = await request(app)
        .post('/api/auth/register')
        .send(userData)
        .expect(400)

      expect(response.body.error).toBe('Datos de entrada inválidos')
    })
  })

  describe('POST /api/auth/login', () => {
    beforeEach(async () => {
      // Crear un usuario verificado para las pruebas
      await userModel.create({
        email: 'verified@example.com',
        password: await PasswordUtils.hashPassword('Password123!'),
        isEmailVerified: true,
      })

      // Crear un usuario no verificado
      await userModel.create({
        email: 'unverified@example.com',
        password: await PasswordUtils.hashPassword('Password123!'),
        isEmailVerified: false,
      })
    })

    test('should login successfully with correct credentials', async () => {
      const loginData = {
        email: 'verified@example.com',
        password: 'Password123!',
      }

      const response = await request(app)
        .post('/api/auth/login')
        .send(loginData)
        .expect(200)

      expect(response.body.message).toBe('Inicio de sesión exitoso')
      expect(response.body.token).toBeDefined()
      expect(response.body.user.email).toBe(loginData.email)
      expect(response.body.user.isEmailVerified).toBe(true)
    })

    test('should reject login with incorrect email', async () => {
      const loginData = {
        email: 'nonexistent@example.com',
        password: 'Password123!',
      }

      const response = await request(app)
        .post('/api/auth/login')
        .send(loginData)
        .expect(401)

      expect(response.body.error).toBe('Credenciales inválidas')
    })

    test('should reject login with incorrect password', async () => {
      const loginData = {
        email: 'verified@example.com',
        password: 'WrongPassword123!',
      }

      const response = await request(app)
        .post('/api/auth/login')
        .send(loginData)
        .expect(401)

      expect(response.body.error).toBe('Credenciales inválidas')
    })

    test('should reject login for unverified user', async () => {
      const loginData = {
        email: 'unverified@example.com',
        password: 'Password123!',
      }

      const response = await request(app)
        .post('/api/auth/login')
        .send(loginData)
        .expect(401)

      expect(response.body.error).toContain('Email no verificado')
    })

    test('should reject login with invalid email format', async () => {
      const loginData = {
        email: 'invalid-email',
        password: 'Password123!',
      }

      const response = await request(app)
        .post('/api/auth/login')
        .send(loginData)
        .expect(400)

      expect(response.body.error).toBe('Datos de entrada inválidos')
    })

    test('should reject login with missing credentials', async () => {
      const loginData = {
        email: 'verified@example.com',
        // password missing
      }

      const response = await request(app)
        .post('/api/auth/login')
        .send(loginData)
        .expect(400)

      expect(response.body.error).toBe('Datos de entrada inválidos')
    })
  })

  describe('GET /api/auth/verify-email/:token', () => {
    test('should verify email with valid token', async () => {
      const user = await userModel.create({
        email: 'test@example.com',
        password: 'hashedpassword',
        isEmailVerified: false,
        emailVerificationToken: 'valid-token-123',
      })

      const response = await request(app)
        .get('/api/auth/verify-email/valid-token-123')
        .expect(200)

      expect(response.body.message).toContain('Email verificado exitosamente')
      expect(response.body.user.isEmailVerified).toBe(true)

      // Verificar que el usuario fue actualizado en la base de datos
      const updatedUser = await userModel.findById(user.id)
      expect(updatedUser?.isEmailVerified).toBe(true)
      expect(updatedUser?.emailVerificationToken).toBeUndefined()
    })

    test('should reject verification with invalid token', async () => {
      await userModel.create({
        email: 'test@example.com',
        password: 'hashedpassword',
        isEmailVerified: false,
        emailVerificationToken: 'valid-token-123',
      })

      const response = await request(app)
        .get('/api/auth/verify-email/invalid-token')
        .expect(400)

      expect(response.body.error).toContain('Token de verificación inválido')
    })

    test('should reject verification with missing token', async () => {
      const response = await request(app)
        .get('/api/auth/verify-email/')
        .expect(404)
    })
  })

  describe('GET /api/auth/profile', () => {
    let authToken: string
    let userId: string

    beforeEach(async () => {
      const user = await userModel.create({
        email: 'test@example.com',
        password: 'hashedpassword',
        isEmailVerified: true,
      })

      userId = user.id
      authToken = TokenUtils.generateJWT({ id: user.id, email: user.email })
    })

    test('should get profile with valid token', async () => {
      const response = await request(app)
        .get('/api/auth/profile')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200)

      expect(response.body.user.id).toBe(userId)
      expect(response.body.user.email).toBe('test@example.com')
      expect(response.body.user.isEmailVerified).toBe(true)
      expect(response.body.user.createdAt).toBeDefined()
    })

    test('should reject request without token', async () => {
      const response = await request(app).get('/api/auth/profile').expect(401)

      expect(response.body.error).toBe('Token de acceso requerido')
    })

    test('should reject request with invalid token', async () => {
      const response = await request(app)
        .get('/api/auth/profile')
        .set('Authorization', 'Bearer invalid-token')
        .expect(403)

      expect(response.body.error).toBe('Token inválido')
    })

    test('should reject request with malformed Authorization header', async () => {
      const response = await request(app)
        .get('/api/auth/profile')
        .set('Authorization', 'InvalidFormat')
        .expect(401)

      expect(response.body.error).toBe('Token de acceso requerido')
    })
  })
})
