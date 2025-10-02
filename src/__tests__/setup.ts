// Configuración global para todos los tests

// Mock fetch global para las pruebas
global.fetch = jest.fn()

// Configuración del entorno de testing
process.env.NODE_ENV = 'test'
process.env.API_BASE_URL = 'https://thinking-tester-contact-list.herokuapp.com'

// Mock console para tests más limpios (opcional)
const originalConsole = { ...console }

// Configuración que se ejecuta antes de cada test
beforeEach(() => {
  // Limpiar mocks antes de cada test
  jest.clearAllMocks()

  // Reset fetch mock
  ;(fetch as jest.MockedFunction<typeof fetch>).mockClear()
})

// Configuración que se ejecuta después de todos los tests
afterAll(() => {
  // Restaurar console original si fue mockeado
  global.console = originalConsole
})

// Configurar timeout por defecto para tests
jest.setTimeout(10000)

// Mock global para errores de red
global.mockApiError = (message: string = 'Network Error') => {
  ;(fetch as jest.MockedFunction<typeof fetch>).mockRejectedValue(
    new Error(message)
  )
}

// Mock global para respuestas exitosas
global.mockApiSuccess = (data: any, status: number = 200) => {
  ;(fetch as jest.MockedFunction<typeof fetch>).mockResolvedValue({
    ok: status >= 200 && status < 300,
    status,
    json: () => Promise.resolve(data),
    text: () => Promise.resolve(JSON.stringify(data)),
  } as Response)
}
