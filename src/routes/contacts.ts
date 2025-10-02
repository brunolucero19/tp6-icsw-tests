import { Router } from 'express'
import { ContactController } from '../controllers/ContactController'
import {
  validateContact,
  validateContactUpdate,
} from '../middleware/validation'
import { authenticateToken } from '../middleware/auth'

const router = Router()

// Todas las rutas requieren autenticación
router.use(authenticateToken)

/**
 * @route   GET /api/contacts
 * @desc    Obtener todos los contactos del usuario
 * @access  Private
 */
router.get('/', ContactController.getContacts)

/**
 * @route   GET /api/contacts/:id
 * @desc    Obtener un contacto específico
 * @access  Private
 */
router.get('/:id', ContactController.getContact)

/**
 * @route   POST /api/contacts
 * @desc    Crear nuevo contacto
 * @access  Private
 */
router.post('/', validateContact, ContactController.createContact)

/**
 * @route   PUT /api/contacts/:id
 * @desc    Actualizar contacto existente
 * @access  Private
 */
router.put('/:id', validateContactUpdate, ContactController.updateContact)

/**
 * @route   DELETE /api/contacts/:id
 * @desc    Eliminar contacto
 * @access  Private
 */
router.delete('/:id', ContactController.deleteContact)

export default router
