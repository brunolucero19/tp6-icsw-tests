// Setup para tests de integración

export const API_BASE_URL = 'https://thinking-tester-contact-list.herokuapp.com'

export const TEST_CONFIG = {
  timeout: 30000, // 30 segundos para requests HTTP reales
  retries: 2, // Reintentos en caso de fallas de red
}

// Helper para generar datos de test únicos
export const generateTestUser = () => {
  const timestamp = Date.now()
  const random = Math.floor(Math.random() * 1000)

  return {
    firstName: `Test${random}`,
    lastName: `User${timestamp}`,
    email: `test${timestamp}${random}@example.com`,
    password: 'TestPassword123',
  }
}

// Helper para generar datos de contacto únicos
export const generateTestContact = () => {
  const timestamp = Date.now()
  const random = Math.floor(Math.random() * 1000)

  return {
    firstName: `Contact${random}`,
    lastName: `Test${timestamp}`,
    birthdate: '1990-01-01',
    email: `contact${timestamp}${random}@example.com`,
    phone: '8005555555',
    street1: '1 Main St.',
    street2: 'Apartment A',
    city: 'Anytown',
    stateProvince: 'KS',
    postalCode: '12345',
    country: 'USA',
  }
}

// Delay helper para evitar rate limiting
export const delay = (ms: number) =>
  new Promise((resolve) => setTimeout(resolve, ms))
