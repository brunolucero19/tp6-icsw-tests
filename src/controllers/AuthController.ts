import { Request, Response } from 'express'
import { userModel } from '../models/User'
import { PasswordUtils, TokenUtils, ValidationUtils } from '../utils/auth'
import { emailService } from '../services/EmailService'
import { CreateUserRequest, LoginRequest } from '../types'

export class AuthController {
  /**
   * Registro de nuevo usuario
   */
  static async register(req: Request, res: Response): Promise<void> {
    try {
      const { email, password, confirmPassword }: CreateUserRequest = req.body

      // Verificar si el usuario ya existe
      const existingUser = await userModel.findByEmail(email)
      if (existingUser) {
        res.status(400).json({ error: 'El usuario ya existe' })
        return
      }

      // Hashear contraseña
      const hashedPassword = await PasswordUtils.hashPassword(password)

      // Generar token de verificación
      const emailVerificationToken = TokenUtils.generateEmailVerificationToken()

      // Crear usuario
      const user = await userModel.create({
        email,
        password: hashedPassword,
        isEmailVerified: false,
        emailVerificationToken,
      })

      // Enviar email de verificación
      await emailService.sendVerificationEmail(email, emailVerificationToken)

      res.status(201).json({
        message:
          'Usuario registrado exitosamente. Revisa tu email para verificar tu cuenta.',
        user: {
          id: user.id,
          email: user.email,
          isEmailVerified: user.isEmailVerified,
        },
      })
    } catch (error) {
      console.error('Error en registro:', error)
      res.status(500).json({ error: 'Error interno del servidor' })
    }
  }

  /**
   * Inicio de sesión
   */
  static async login(req: Request, res: Response): Promise<void> {
    try {
      const { email, password }: LoginRequest = req.body

      // Buscar usuario
      const user = await userModel.findByEmail(email)
      if (!user) {
        res.status(401).json({ error: 'Credenciales inválidas' })
        return
      }

      // Verificar que el email esté verificado
      if (!user.isEmailVerified) {
        res.status(401).json({
          error:
            'Email no verificado. Revisa tu correo para verificar tu cuenta.',
        })
        return
      }

      // Verificar contraseña
      const isPasswordValid = await PasswordUtils.comparePassword(
        password,
        user.password
      )
      if (!isPasswordValid) {
        res.status(401).json({ error: 'Credenciales inválidas' })
        return
      }

      // Generar token JWT
      const token = TokenUtils.generateJWT({
        id: user.id,
        email: user.email,
      })

      res.json({
        message: 'Inicio de sesión exitoso',
        token,
        user: {
          id: user.id,
          email: user.email,
          isEmailVerified: user.isEmailVerified,
        },
      })
    } catch (error) {
      console.error('Error en login:', error)
      res.status(500).json({ error: 'Error interno del servidor' })
    }
  }

  /**
   * Verificación de email
   */
  static async verifyEmail(req: Request, res: Response): Promise<void> {
    try {
      const { token } = req.params

      if (!token) {
        res.status(400).json({ error: 'Token de verificación requerido' })
        return
      }

      // Verificar email con el token
      const user = await userModel.verifyEmail(token)
      if (!user) {
        res.status(400).json({
          error: 'Token de verificación inválido o expirado',
        })
        return
      }

      res.json({
        message: 'Email verificado exitosamente. Ya puedes iniciar sesión.',
        user: {
          id: user.id,
          email: user.email,
          isEmailVerified: user.isEmailVerified,
        },
      })
    } catch (error) {
      console.error('Error en verificación de email:', error)
      res.status(500).json({ error: 'Error interno del servidor' })
    }
  }

  /**
   * Obtener información del usuario autenticado
   */
  static async getProfile(req: any, res: Response): Promise<void> {
    try {
      const userId = req.user?.id

      const user = await userModel.findById(userId)
      if (!user) {
        res.status(404).json({ error: 'Usuario no encontrado' })
        return
      }

      res.json({
        user: {
          id: user.id,
          email: user.email,
          isEmailVerified: user.isEmailVerified,
          createdAt: user.createdAt,
        },
      })
    } catch (error) {
      console.error('Error obteniendo perfil:', error)
      res.status(500).json({ error: 'Error interno del servidor' })
    }
  }
}
