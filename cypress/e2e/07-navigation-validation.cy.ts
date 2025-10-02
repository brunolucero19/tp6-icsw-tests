// Test 7: Navegación y Validaciones de Formularios
// Integrante: Juan Pablo Costa

describe('E2E Test 7 - Navigation and Form Validation Flow', () => {
  let testUser: any

  beforeEach(() => {
    // Crear usuario único
    const timestamp = Date.now()
    const random = Math.floor(Math.random() * 1000)

    testUser = {
      firstName: `NavTest${random}`,
      lastName: `User${timestamp}`,
      email: `navtest${timestamp}${random}@cypress.com`,
      password: 'NavPassword123',
    }

    // Registrar usuario
    cy.visit('/addUser')
    cy.get('#firstName').type(testUser.firstName)
    cy.get('#lastName').type(testUser.lastName)
    cy.get('#email').type(testUser.email)
    cy.get('#password').type(testUser.password)
    cy.get('#submit').click()
    cy.url().should('include', '/contactList')
  })

  it('should navigate correctly between all main pages', () => {
    // Verificar navegación desde Contact List
    cy.url().should('include', '/contactList')
    cy.contains('Contact List').should('be.visible')

    // Navegar a Add Contact
    cy.get('#add-contact').click()
    cy.url().should('include', '/addContact')
    cy.contains('Add Contact').should('be.visible')

    // Volver a Contact List usando Cancel
    cy.get('#cancel').click()
    cy.url().should('include', '/contactList')

    // Probar logout y navegación pública
    cy.get('#logout').click()
    cy.url().should('eq', Cypress.config().baseUrl + '/')

    // Navegar a Sign Up
    cy.get('#signup').click()
    cy.url().should('include', '/addUser')
    cy.contains('Add User').should('be.visible')

    // Navegar a Login desde Sign Up
    cy.contains('sign in').click()
    cy.url().should('include', '/login')
    cy.contains('Contact List').should('be.visible')

    // Volver a home
    cy.visit('/')
    cy.get('#signup').should('be.visible')
    cy.get('#login').should('be.visible')
  })

  it('should validate form fields with proper error handling', () => {
    // Test validaciones en Add Contact
    cy.get('#add-contact').click()
    cy.url().should('include', '/addContact')

    // Probar envío de formulario vacío
    cy.get('#submit').click()
    cy.url().should('include', '/addContact') // Debe permanecer en la página

    // Probar email inválido
    cy.get('#firstName').type('Test')
    cy.get('#lastName').type('User')
    cy.get('#email').type('invalid-email')
    cy.get('#submit').click()
    cy.url().should('include', '/addContact')

    // Probar con email válido
    cy.get('#email').clear().type('valid@email.com')
    cy.get('#submit').click()
    cy.url().should('include', '/contactList')
  })

  it('should handle browser back/forward navigation correctly', () => {
    // Navegar a Add Contact
    cy.get('#add-contact').click()
    cy.url().should('include', '/addContact')

    // Usar navegación del browser para volver
    cy.go('back')
    cy.url().should('include', '/contactList')

    // Ir hacia adelante
    cy.go('forward')
    cy.url().should('include', '/addContact')

    // Volver a contact list y crear un contacto
    cy.go('back')
    cy.get('#add-contact').click()
    cy.get('#firstName').type('BackForward')
    cy.get('#lastName').type('Test')
    cy.get('#email').type(`backforward${Date.now()}@test.com`)
    cy.get('#submit').click()

    // Hacer click en el contacto
    cy.contains('BackForward Test').click()
    cy.url().should('include', '/contactDetails')

    // Navegar atrás múltiples veces
    cy.go('back')
    cy.url().should('include', '/contactList')
  })

  it('should maintain form state during navigation interruptions', () => {
    // Ir a agregar contacto
    cy.get('#add-contact').click()

    // Llenar parcialmente el formulario
    cy.get('#firstName').type('Partial')
    cy.get('#lastName').type('Fill')
    cy.get('#email').type('partial@test.com')

    // Navegar away y volver
    cy.get('#return').click()
    cy.url().should('include', '/contactList')

    cy.get('#add-contact').click()

    // El formulario debería estar limpio (comportamiento esperado)
    cy.get('#firstName').should('have.value', '')
    cy.get('#lastName').should('have.value', '')
    cy.get('#email').should('have.value', '')
  })

  it('should validate protected routes access', () => {
    // Logout primero
    cy.get('#logout').click()
    cy.url().should('eq', Cypress.config().baseUrl + '/')

    // Intentar acceder directamente a rutas protegidas
    const protectedRoutes = ['/contactList', '/addContact']

    protectedRoutes.forEach((route) => {
      cy.visit(route)
      // Debería redirigir a login o home, no permitir acceso
      cy.url().should('not.include', route)
    })
  })

  it('should handle form validation for different field types', () => {
    // Login nuevamente para acceder a formularios
    cy.visit('/login')
    cy.get('#email').type(testUser.email)
    cy.get('#password').type(testUser.password)
    cy.get('#submit').click()

    cy.get('#add-contact').click()

    // Test diferentes tipos de validación

    // Email validation
    cy.get('#firstName').type('Validation')
    cy.get('#lastName').type('Test')

    const invalidEmails = [
      'invalid',
      '@invalid.com',
      'invalid@',
      'invalid@.com',
    ]
    invalidEmails.forEach((email) => {
      cy.get('#email').clear().type(email)
      cy.get('#submit').click()
      cy.url().should('include', '/addContact') // No debería proceder
    })

    // Phone validation (si existe)
    cy.get('#email').clear().type('valid@email.com')
    cy.get('#phone').type('invalid-phone')
    cy.get('#submit').click()
    cy.url().should('include', '/addContact')

    // Date validation (si existe)
    cy.get('#phone').clear().type('5551234567')
    cy.get('#birthdate').type('invalid-date')
    cy.get('#submit').click()
    cy.url().should('include', '/addContact')

    // Valid form submission
    cy.get('#birthdate').clear().type('1990-01-01')
    cy.get('#submit').click()
    cy.url().should('include', '/contactList')
  })

  it('should maintain user session across page reloads', () => {
    // Verificar que estamos logueados
    cy.get('#logout').should('be.visible')
    cy.url().should('include', '/contactList')

    // Recargar la página
    cy.reload()

    // Verificar que la sesión se mantiene
    cy.url().should('include', '/contactList')
    cy.get('#logout').should('be.visible')
    cy.get('#add-contact').should('be.visible')

    // Navegar a otra página y recargar
    cy.get('#add-contact').click()
    cy.reload()
    cy.url().should('include', '/addContact')

    // La sesión debería mantenerse
    cy.get('#logout').should('be.visible')
  })

  it('should handle responsive design elements', () => {
    // Test en diferentes viewport sizes
    const viewports = [
      { width: 1200, height: 800 }, // Desktop
      { width: 768, height: 1024 }, // Tablet
      { width: 375, height: 667 }, // Mobile
    ]

    viewports.forEach((viewport) => {
      cy.viewport(viewport.width, viewport.height)

      // Verificar que elementos principales siguen siendo accesibles
      cy.get('#logout').should('be.visible')
      cy.get('#add-contact').should('be.visible')

      // Test navigation en este viewport
      cy.get('#add-contact').click()
      cy.url().should('include', '/addContact')
      cy.get('#firstName').should('be.visible')
      cy.get('#submit').should('be.visible')

      // Volver a contact list
      cy.get('#cancel').click()
      cy.url().should('include', '/contactList')
    })
  })
})
