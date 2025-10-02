import { Request, Response, NextFunction } from 'express'
import { TokenUtils } from '../utils/auth'
import { userModel } from '../models/User'

export interface AuthenticatedRequest extends Request {
  user?: {
    id: string
    email: string
  }
}

export const authenticateToken = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const authHeader = req.headers.authorization
    const token = authHeader && authHeader.split(' ')[1] // Bearer TOKEN

    if (!token) {
      res.status(401).json({ error: 'Token de acceso requerido' })
      return
    }

    const decoded = TokenUtils.verifyJWT(token) as { id: string; email: string }

    // Verificar que el usuario existe y está verificado
    const user = await userModel.findById(decoded.id)
    if (!user || !user.isEmailVerified) {
      res.status(401).json({ error: 'Usuario no encontrado o no verificado' })
      return
    }

    req.user = {
      id: decoded.id,
      email: decoded.email,
    }

    next()
  } catch (error) {
    console.error('Error en autenticación:', error)
    res.status(403).json({ error: 'Token inválido' })
  }
}

export const optionalAuth = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const authHeader = req.headers.authorization
    const token = authHeader && authHeader.split(' ')[1]

    if (token) {
      const decoded = TokenUtils.verifyJWT(token) as {
        id: string
        email: string
      }
      const user = await userModel.findById(decoded.id)

      if (user && user.isEmailVerified) {
        req.user = {
          id: decoded.id,
          email: decoded.email,
        }
      }
    }

    next()
  } catch (error) {
    // En autenticación opcional, si hay error simplemente continuamos sin usuario
    next()
  }
}
