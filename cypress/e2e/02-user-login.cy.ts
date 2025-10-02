// Test 2: Login de Usuario Exitoso
// Integrante: Vincenzo Dallape

describe('E2E Test 2 - User Login Flow', () => {
  let testUser: any

  before(() => {
    // Crear un usuario para usar en los tests de login
    const timestamp = Date.now()
    const random = Math.floor(Math.random() * 1000)

    testUser = {
      firstName: `LoginTest${random}`,
      lastName: `User${timestamp}`,
      email: `logintest${timestamp}${random}@cypress.com`,
      password: 'LoginPassword123',
    }

    // Registrar el usuario
    cy.visit('/addUser')
    cy.get('#firstName').type(testUser.firstName)
    cy.get('#lastName').type(testUser.lastName)
    cy.get('#email').type(testUser.email)
    cy.get('#password').type(testUser.password)
    cy.get('#submit').click()
    cy.url().should('include', '/contactList')

    // Logout para poder hacer login después
    cy.get('#logout').click()
  })

  it('should successfully login with valid credentials', () => {
    // Visitar la página de login
    cy.visit('/login')

    // Verificar que estamos en la página correcta
    cy.url().should('include', '/login')
    cy.contains('Contact List').should('be.visible')

    // Llenar credenciales
    cy.get('#email').should('be.visible').clear().type(testUser.email)
    cy.get('#password').should('be.visible').clear().type(testUser.password)

    // Hacer login
    cy.get('#submit').click()

    // Verificar redirección exitosa
    cy.url().should('include', '/contactList')

    // Verificar elementos de la interfaz logueada
    cy.contains('Contact List').should('be.visible')
    cy.get('#logout').should('be.visible')
    cy.get('#add-contact').should('be.visible')

    // Verificar que se muestra el nombre del usuario
    cy.contains(testUser.firstName).should('be.visible')
  })

  it('should reject login with invalid credentials', () => {
    cy.visit('/login')

    // Probar con email inexistente
    cy.get('#email').type('nonexistent@example.com')
    cy.get('#password').type('wrongpassword')
    cy.get('#submit').click()

    // Verificar que permanecemos en login
    cy.url().should('include', '/login')

    // Limpiar campos
    cy.get('#email').clear()
    cy.get('#password').clear()

    // Probar con email correcto pero password incorrecto
    cy.get('#email').type(testUser.email)
    cy.get('#password').type('wrongpassword')
    cy.get('#submit').click()

    // Verificar que permanecemos en login
    cy.url().should('include', '/login')
  })

  it('should show validation for empty login form', () => {
    cy.visit('/login')

    // Intentar login sin datos
    cy.get('#submit').click()

    // Verificar que permanecemos en la página de login
    cy.url().should('include', '/login')

    // Probar solo con email
    cy.get('#email').type(testUser.email)
    cy.get('#submit').click()
    cy.url().should('include', '/login')

    // Limpiar y probar solo con password
    cy.get('#email').clear()
    cy.get('#password').type(testUser.password)
    cy.get('#submit').click()
    cy.url().should('include', '/login')
  })

  it('should maintain session after page refresh', () => {
    // Login
    cy.visit('/login')
    cy.get('#email').type(testUser.email)
    cy.get('#password').type(testUser.password)
    cy.get('#submit').click()
    cy.url().should('include', '/contactList')

    // Refrescar la página
    cy.reload()

    // Verificar que la sesión se mantiene
    cy.url().should('include', '/contactList')
    cy.get('#logout').should('be.visible')
  })
})
