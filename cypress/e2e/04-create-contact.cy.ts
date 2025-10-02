// Test 4: Crear Nuevo Contacto
// Integrante: Matías Visedo

describe('E2E Test 4 - Create New Contact Flow', () => {
  let testUser: any
  let testContact: any

  beforeEach(() => {
    // Crear usuario y contacto únicos
    const timestamp = Date.now()
    const random = Math.floor(Math.random() * 1000)

    testUser = {
      firstName: `ContactCreator${random}`,
      lastName: `User${timestamp}`,
      email: `creator${timestamp}${random}@cypress.com`,
      password: 'CreatorPassword123',
    }

    testContact = {
      firstName: `Contact${random}`,
      lastName: `Test${timestamp}`,
      birthdate: '1985-06-15',
      email: `contact${timestamp}${random}@fake.com`,
      phone: '5551234567',
      street1: '123 Main Street',
      street2: 'Apt 4B',
      city: 'Test City',
      stateProvince: 'TC',
      postalCode: '12345',
      country: 'Test Country',
    }

    // Registrar usuario y hacer login
    cy.visit('/addUser')
    cy.get('#firstName').type(testUser.firstName)
    cy.get('#lastName').type(testUser.lastName)
    cy.get('#email').type(testUser.email)
    cy.get('#password').type(testUser.password)
    cy.get('#submit').click()
    cy.url().should('include', '/contactList')
  })

  it('should successfully create a new contact with all fields', () => {
    // Navegar a la página de agregar contacto
    cy.get('#add-contact').click()
    cy.url().should('include', '/addContact')

    // Verificar que estamos en la página correcta
    cy.contains('Add Contact').should('be.visible')

    // Llenar todos los campos del contacto
    cy.get('#firstName').type(testContact.firstName)
    cy.get('#lastName').type(testContact.lastName)
    cy.get('#birthdate').type(testContact.birthdate)
    cy.get('#email').type(testContact.email)
    cy.get('#phone').type(testContact.phone)
    cy.get('#street1').type(testContact.street1)
    cy.get('#street2').type(testContact.street2)
    cy.get('#city').type(testContact.city)
    cy.get('#stateProvince').type(testContact.stateProvince)
    cy.get('#postalCode').type(testContact.postalCode)
    cy.get('#country').type(testContact.country)

    // Enviar el formulario
    cy.get('#submit').click()

    // Verificar redirección a la lista de contactos
    cy.url().should('include', '/contactList')

    // Verificar que el contacto aparece en la lista
    cy.contains(`${testContact.firstName} ${testContact.lastName}`).should(
      'be.visible'
    )
    cy.contains(testContact.email).should('be.visible')
  })

  it('should create contact with only required fields', () => {
    cy.get('#add-contact').click()
    cy.url().should('include', '/addContact')

    // Llenar solo campos requeridos
    cy.get('#firstName').type(testContact.firstName)
    cy.get('#lastName').type(testContact.lastName)
    cy.get('#email').type(testContact.email)

    // Enviar formulario
    cy.get('#submit').click()

    // Verificar que se creó el contacto
    cy.url().should('include', '/contactList')
    cy.contains(`${testContact.firstName} ${testContact.lastName}`).should(
      'be.visible'
    )
  })

  it('should show validation errors for invalid contact data', () => {
    cy.get('#add-contact').click()
    cy.url().should('include', '/addContact')

    // Intentar enviar formulario vacío
    cy.get('#submit').click()

    // Verificar que permanecemos en la página de agregar contacto
    cy.url().should('include', '/addContact')

    // Probar con email inválido
    cy.get('#firstName').type('Test')
    cy.get('#lastName').type('Contact')
    cy.get('#email').type('invalid-email-format')
    cy.get('#submit').click()

    // Verificar que no se redirige
    cy.url().should('include', '/addContact')
  })

  it('should handle special characters in contact fields', () => {
    cy.get('#add-contact').click()

    // Crear contacto con caracteres especiales
    const specialContact = {
      firstName: 'José María',
      lastName: 'García-López',
      email: `special${Date.now()}@test.com`,
      city: 'São Paulo',
      country: 'España',
    }

    cy.get('#firstName').type(specialContact.firstName)
    cy.get('#lastName').type(specialContact.lastName)
    cy.get('#email').type(specialContact.email)
    cy.get('#city').type(specialContact.city)
    cy.get('#country').type(specialContact.country)

    cy.get('#submit').click()

    // Verificar que se creó correctamente
    cy.url().should('include', '/contactList')
    cy.contains(specialContact.firstName).should('be.visible')
    cy.contains(specialContact.lastName).should('be.visible')
  })

  
})
