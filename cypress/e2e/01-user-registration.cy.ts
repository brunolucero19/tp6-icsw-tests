// Test 1: Registro de Usuario Completo
// Integrante: Octavio Díaz

describe('E2E Test 1 - User Registration Flow', () => {
  let testData: any

  beforeEach(() => {
    // Generar datos únicos para cada test
    const timestamp = Date.now()
    const random = Math.floor(Math.random() * 1000)

    testData = {
      firstName: `John${random}`,
      lastName: `Doe${timestamp}`,
      email: `john${timestamp}${random}@cypress.com`,
      password: 'MyPassword123',
    }
  })

  it('should successfully register a new user with valid data', () => {
    // Visitar la página de registro
    cy.visit('/addUser')

    // Verificar que estamos en la página correcta
    cy.url().should('include', '/addUser')
    cy.contains('Add User').should('be.visible')

    // Llenar el formulario de registro
    cy.get('#firstName').should('be.visible').type(testData.firstName)
    cy.get('#lastName').should('be.visible').type(testData.lastName)
    cy.get('#email').should('be.visible').type(testData.email)
    cy.get('#password').should('not.be.disabled').type(testData.password)


    // Enviar el formulario
    cy.get('#submit').click()

    // Verificar redirección exitosa a la lista de contactos
    cy.url().should('include', '/contactList')

    // Verificar que el usuario está logueado
    cy.contains('Contact List').should('be.visible')
    cy.get('#logout').should('be.visible')

   
  })

  it('should show validation errors for invalid registration data', () => {
    cy.visit('/addUser')

    // Intentar enviar formulario vacío
    cy.get('#submit').click()

    // Verificar que permanecemos en la página de registro
    cy.url().should('include', '/addUser')

    // Probar con email inválido
    cy.get('#firstName').type('Test')
    cy.get('#lastName').type('User')
    cy.get('#email').type('invalid-email')
    cy.get('#password').type('123')
    cy.get('#submit').click()

    // Verificar que no se redirige (formulario inválido)
    cy.url().should('include', '/addUser')
  })

  it('should not allow duplicate email registration', () => {
    // Primer registro
    cy.visit('/addUser')
    cy.get('#firstName').type(testData.firstName)
    cy.get('#lastName').type(testData.lastName)
    cy.get('#email').type(testData.email)
    cy.get('#password').type(testData.password)
    cy.get('#submit').click()

    // Verificar registro exitoso
    cy.url().should('include', '/contactList')

    // Logout
    cy.get('#logout').click()
    cy.url().should('include', '/')

    // Intentar registrar el mismo email nuevamente
    cy.visit('/addUser')
    cy.get('#firstName').type('Another')
    cy.get('#lastName').type('User')
    cy.get('#email').type(testData.email) // Mismo email
    cy.get('#password').type('AnotherPassword123')
    cy.get('#submit').click()

    // Verificar que no se permite el registro duplicado
    cy.url().should('include', '/addUser')
  })
})
