// ***********************************************
// This example commands.ts shows you how to
// create various custom commands and overwrite
// existing commands.
//
// For more comprehensive examples of custom
// commands please read more here:
// https://on.cypress.io/custom-commands
// ***********************************************

// Comandos personalizados para la aplicación Contact List

declare global {
  namespace Cypress {
    interface Chainable {
      /**
       * Comando personalizado para login
       * @example cy.login('user@example.com', 'password123')
       */
      login(email: string, password: string): Chainable<void>

      /**
       * Comando personalizado para registro
       * @example cy.register('John', 'Doe', 'user@example.com', 'password123')
       */
      register(
        firstName: string,
        lastName: string,
        email: string,
        password: string
      ): Chainable<void>

      /**
       * Comando personalizado para crear contacto
       * @example cy.createContact(contactData)
       */
      createContact(contactData: any): Chainable<void>

      /**
       * Comando para generar datos únicos de test
       */
      generateTestData(): Chainable<{
        email: string
        firstName: string
        lastName: string
        password: string
      }>
    }
  }
}

// Comando para login
Cypress.Commands.add('login', (email: string, password: string) => {
  cy.visit('/login')
  cy.get('#email').type(email)
  cy.get('#password').type(password)
  cy.get('#submit').click()
  cy.url().should('include', '/contactList')
})

// Comando para registro
Cypress.Commands.add(
  'register',
  (firstName: string, lastName: string, email: string, password: string) => {
    cy.visit('/addUser')
    cy.get('#firstName').type(firstName)
    cy.get('#lastName').type(lastName)
    cy.get('#email').type(email)
    cy.get('#password').type(password)
    cy.get('#submit').click()
    cy.url().should('include', '/contactList')
  }
)

// Comando para crear contacto
Cypress.Commands.add('createContact', (contactData) => {
  cy.visit('/addContact')
  cy.get('#firstName').type(contactData.firstName)
  cy.get('#lastName').type(contactData.lastName)
  cy.get('#birthdate').type(contactData.birthdate)
  cy.get('#email').type(contactData.email)
  cy.get('#phone').type(contactData.phone)
  cy.get('#street1').type(contactData.street1)
  cy.get('#street2').type(contactData.street2 || '')
  cy.get('#city').type(contactData.city)
  cy.get('#stateProvince').type(contactData.stateProvince)
  cy.get('#postalCode').type(contactData.postalCode)
  cy.get('#country').type(contactData.country)
  cy.get('#submit').click()
})

// Comando para generar datos únicos
Cypress.Commands.add('generateTestData', () => {
  const timestamp = Date.now()
  const random = Math.floor(Math.random() * 1000)

  return cy.wrap({
    firstName: `Test${random}`,
    lastName: `User${timestamp}`,
    email: `test${timestamp}${random}@cypress.com`,
    password: 'TestPassword123',
  })
})
