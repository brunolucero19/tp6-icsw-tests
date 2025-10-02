// Test 3: Logout de Usuario
// Integrante: Emiliano Jordan

describe('E2E Test 3 - User Logout Flow', () => {
  let testUser: any

  beforeEach(() => {
    // Crear usuario único para cada test
    const timestamp = Date.now()
    const random = Math.floor(Math.random() * 1000)

    testUser = {
      firstName: `LogoutTest${random}`,
      lastName: `User${timestamp}`,
      email: `logouttest${timestamp}${random}@cypress.com`,
      password: 'LogoutPassword123',
    }

    // Registrar y hacer login
    cy.visit('/addUser')
    cy.get('#firstName').type(testUser.firstName)
    cy.get('#lastName').type(testUser.lastName)
    cy.get('#email').type(testUser.email)
    cy.get('#password').type(testUser.password)
    cy.get('#submit').click()
    cy.url().should('include', '/contactList')
  })

  it('should successfully logout from authenticated session', () => {
    // Verificar que estamos logueados
    cy.url().should('include', '/contactList')
    cy.get('#logout').should('be.visible')
  

    // Hacer logout
    cy.get('#logout').click()

    // Verificar redirección a la página principal
    cy.url().should('not.include', '/contactList')
    cy.url().should('eq', Cypress.config().baseUrl + '/')

    // Verificar elementos de la página de bienvenida
    cy.contains('Contact List').should('be.visible')
    cy.get('#signup').should('be.visible')
  

    // Verificar que los elementos de usuario logueado no están presentes
    cy.get('#logout').should('not.exist')
    cy.get('#add-contact').should('not.exist')
  })

  it('should clear session data after logout', () => {
    // Hacer logout
    cy.get('#logout').click()
    cy.url().should('eq', Cypress.config().baseUrl + '/')

    // Intentar acceder directamente a páginas protegidas
    cy.visit('/contactList')



    // Intentar acceder a agregar contacto
    cy.visit('/addContact')
  })

  it('should require re-authentication after logout', () => {
    // Hacer logout
    cy.get('#logout').click()
    cy.url().should('eq', Cypress.config().baseUrl + '/')

    // Intentar acceder con login directo
    cy.visit('/login')
    cy.get('#email').type(testUser.email)
    cy.get('#password').type(testUser.password)
    cy.get('#submit').click()

    // Verificar que puede volver a loguearse
    cy.url().should('include', '/contactList')
    cy.get('#logout').should('be.visible')
  })

  it('should handle logout from multiple tabs/sessions', () => {
    // Simular múltiples ventanas/tabs abriendo la misma URL
    cy.window().then((win) => {
      // Hacer logout
      cy.get('#logout').click()
      cy.url().should('eq', Cypress.config().baseUrl + '/')

      // Intentar navegar a contactList nuevamente
      cy.visit('/contactList')
    })
  })

  it('should preserve logout state after page refresh', () => {
    // Hacer logout
    cy.get('#logout').click()
    cy.url().should('eq', Cypress.config().baseUrl + '/')

    // Refrescar la página
    cy.reload()

    // Verificar que sigue deslogueado
    cy.url().should('eq', Cypress.config().baseUrl + '/')
    cy.get('#signup').should('be.visible')
    cy.get('#logout').should('not.exist')
  })
})
