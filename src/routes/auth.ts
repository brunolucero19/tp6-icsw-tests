import { Router } from 'express'
import { AuthController } from '../controllers/AuthController'
import { validateRegistration, validateLogin } from '../middleware/validation'
import { authenticateToken } from '../middleware/auth'

const router = Router()

/**
 * @route   POST /api/auth/register
 * @desc    Registrar nuevo usuario
 * @access  Public
 */
router.post('/register', validateRegistration, AuthController.register)

/**
 * @route   POST /api/auth/login
 * @desc    Iniciar sesión
 * @access  Public
 */
router.post('/login', validateLogin, AuthController.login)

/**
 * @route   GET /api/auth/verify-email/:token
 * @desc    Verificar email del usuario
 * @access  Public
 */
router.get('/verify-email/:token', AuthController.verifyEmail)

/**
 * @route   GET /api/auth/profile
 * @desc    Obtener perfil del usuario autenticado
 * @access  Private
 */
router.get('/profile', authenticateToken, AuthController.getProfile)

export default router
