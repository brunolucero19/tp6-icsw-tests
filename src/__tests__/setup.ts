import { userModel } from '../models/User'
import { contactModel } from '../models/Contact'

// Configuración global para todos los tests
beforeEach(async () => {
  // Limpiar datos antes de cada test
  await userModel.clear()
  await contactModel.clear()
})

// Configuración del entorno de testing
process.env.NODE_ENV = 'test'
process.env.JWT_SECRET = 'test_jwt_secret'
process.env.EMAIL_SERVICE = 'test'
process.env.EMAIL_USER = 'test@example.com'
process.env.EMAIL_PASS = 'test_password'
process.env.BASE_URL = 'http://localhost:3000'

// Mock console.log para tests más limpios
global.console = {
  ...console,
  log: jest.fn(),
  info: jest.fn(),
  warn: jest.fn(),
}
