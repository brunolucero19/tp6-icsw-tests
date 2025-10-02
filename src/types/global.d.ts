// Tipos globales para testing

declare global {
  var mockApiError: (message?: string) => void
  var mockApiSuccess: (data: any, status?: number) => void

  namespace jest {
    interface Matchers<R> {
      // Aquí podemos agregar matchers personalizados si los necesitamos
    }
  }
}

export {}
