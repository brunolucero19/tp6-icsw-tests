import { Request, Response, NextFunction } from 'express'
import { body, validationResult } from 'express-validator'
import { ValidationUtils, PasswordUtils } from '../utils/auth'

export const validateRequest = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  const errors = validationResult(req)

  if (!errors.isEmpty()) {
    res.status(400).json({
      error: 'Datos de entrada inválidos',
      details: errors.array().map((err) => ({
        field: err.type === 'field' ? (err as any).path : 'unknown',
        message: err.msg,
      })),
    })
    return
  }

  next()
}

export const validateRegistration = [
  body('email')
    .isEmail()
    .withMessage('Email debe tener formato válido')
    .normalizeEmail(),

  body('password').custom((value) => {
    const validation = PasswordUtils.validatePassword(value)
    if (!validation.isValid) {
      throw new Error(validation.errors.join(', '))
    }
    return true
  }),

  body('confirmPassword').custom((value, { req }) => {
    if (value !== req.body.password) {
      throw new Error('Las contraseñas no coinciden')
    }
    return true
  }),

  validateRequest,
]

export const validateLogin = [
  body('email')
    .isEmail()
    .withMessage('Email debe tener formato válido')
    .normalizeEmail(),

  body('password').notEmpty().withMessage('Contraseña es requerida'),

  validateRequest,
]

export const validateContact = [
  body('firstName')
    .trim()
    .notEmpty()
    .withMessage('Nombre es requerido')
    .isLength({ min: 1, max: 100 })
    .withMessage('Nombre debe tener entre 1 y 100 caracteres'),

  body('lastName')
    .trim()
    .notEmpty()
    .withMessage('Apellido es requerido')
    .isLength({ min: 1, max: 100 })
    .withMessage('Apellido debe tener entre 1 y 100 caracteres'),

  body('email')
    .optional()
    .isEmail()
    .withMessage('Email debe tener formato válido')
    .normalizeEmail(),

  body('phone')
    .optional()
    .isLength({ max: 20 })
    .withMessage('Teléfono no puede exceder 20 caracteres'),

  body('dateOfBirth')
    .optional()
    .isISO8601()
    .withMessage('Fecha de nacimiento debe tener formato válido (YYYY-MM-DD)'),

  body('address1')
    .optional()
    .isLength({ max: 200 })
    .withMessage('Dirección 1 no puede exceder 200 caracteres'),

  body('address2')
    .optional()
    .isLength({ max: 200 })
    .withMessage('Dirección 2 no puede exceder 200 caracteres'),

  body('city')
    .optional()
    .isLength({ max: 100 })
    .withMessage('Ciudad no puede exceder 100 caracteres'),

  body('state')
    .optional()
    .isLength({ max: 100 })
    .withMessage('Estado no puede exceder 100 caracteres'),

  body('postalCode')
    .optional()
    .isLength({ max: 20 })
    .withMessage('Código postal no puede exceder 20 caracteres'),

  body('country')
    .optional()
    .isLength({ max: 100 })
    .withMessage('País no puede exceder 100 caracteres'),

  validateRequest,
]

export const validateContactUpdate = [
  body('firstName')
    .optional()
    .trim()
    .notEmpty()
    .withMessage('Nombre no puede estar vacío')
    .isLength({ min: 1, max: 100 })
    .withMessage('Nombre debe tener entre 1 y 100 caracteres'),

  body('lastName')
    .optional()
    .trim()
    .notEmpty()
    .withMessage('Apellido no puede estar vacío')
    .isLength({ min: 1, max: 100 })
    .withMessage('Apellido debe tener entre 1 y 100 caracteres'),

  body('email')
    .optional()
    .isEmail()
    .withMessage('Email debe tener formato válido')
    .normalizeEmail(),

  body('phone')
    .optional()
    .isLength({ max: 20 })
    .withMessage('Teléfono no puede exceder 20 caracteres'),

  body('dateOfBirth')
    .optional()
    .isISO8601()
    .withMessage('Fecha de nacimiento debe tener formato válido (YYYY-MM-DD)'),

  body('address1')
    .optional()
    .isLength({ max: 200 })
    .withMessage('Dirección 1 no puede exceder 200 caracteres'),

  body('address2')
    .optional()
    .isLength({ max: 200 })
    .withMessage('Dirección 2 no puede exceder 200 caracteres'),

  body('city')
    .optional()
    .isLength({ max: 100 })
    .withMessage('Ciudad no puede exceder 100 caracteres'),

  body('state')
    .optional()
    .isLength({ max: 100 })
    .withMessage('Estado no puede exceder 100 caracteres'),

  body('postalCode')
    .optional()
    .isLength({ max: 20 })
    .withMessage('Código postal no puede exceder 20 caracteres'),

  body('country')
    .optional()
    .isLength({ max: 100 })
    .withMessage('País no puede exceder 100 caracteres'),

  validateRequest,
]
