// Test 5: Editar Contacto Existente
// Integrante: Valentino Isgró

describe('E2E Test 5 - Edit Existing Contact Flow', () => {
  let testUser: any
  let testContact: any

  beforeEach(() => {
    // Crear usuario y contacto únicos
    const timestamp = Date.now()
    const random = Math.floor(Math.random() * 1000)

    testUser = {
      firstName: `ContactEditor${random}`,
      lastName: `User${timestamp}`,
      email: `editor${timestamp}${random}@cypress.com`,
      password: 'EditorPassword123',
    }

    testContact = {
      firstName: `EditMe${random}`,
      lastName: `Contact${timestamp}`,
      birthdate: '1980-12-25',
      email: `editable${timestamp}${random}@fake.com`,
      phone: '5559876543',
      street1: '456 Edit Street',
      street2: 'Suite 200',
      city: 'Edit City',
      stateProvince: 'EC',
      postalCode: '54321',
      country: 'Edit Country',
    }

    // Registrar usuario
    cy.visit('/addUser')
    cy.get('#firstName').type(testUser.firstName)
    cy.get('#lastName').type(testUser.lastName)
    cy.get('#email').type(testUser.email)
    cy.get('#password').type(testUser.password)
    cy.get('#submit').click()
    cy.url().should('include', '/contactList')

    // Crear contacto para editar
    cy.get('#add-contact').click()
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
    cy.get('#submit').click()
    cy.url().should('include', '/contactList')
  })

  it('should successfully edit an existing contact', () => {
    // Buscar y hacer click en el contacto para editarlo
    cy.contains(`${testContact.firstName} ${testContact.lastName}`).click()

    // Verificar que estamos en la página de detalles
    cy.url().should('include', '/contactDetails')
    cy.contains('Contact Details').should('be.visible')

    // Hacer click en editar
    cy.get('#edit-contact').click()
    cy.url().should('include', '/editContact')

    // Modificar algunos campos
    const updatedData = {
      firstName: `Updated${testContact.firstName}`,
      phone: '5551111111',
      city: 'Updated City',
    }

    cy.get('#firstName').clear().type(updatedData.firstName)
    cy.get('#phone').clear().type(updatedData.phone)
    cy.get('#city').clear().type(updatedData.city)

    // Guardar cambios
    cy.get('#submit').click()

    // Verificar redirección a detalles
    cy.url().should('include', '/contactDetails')

    // Verificar que los cambios se guardaron
    cy.contains(updatedData.firstName).should('be.visible')
    cy.contains(updatedData.phone).should('be.visible')
    cy.contains(updatedData.city).should('be.visible')

    // Volver a la lista y verificar
    cy.get('#return').click()
    cy.url().should('include', '/contactList')
    cy.contains(updatedData.firstName).should('be.visible')
  })

  it('should validate required fields during edit', () => {
    // Acceder al contacto para editar
    cy.contains(`${testContact.firstName} ${testContact.lastName}`).click()
    cy.get('#edit-contact').click()
    cy.url().should('include', '/editContact')

    // Intentar limpiar campos requeridos
    cy.get('#firstName').clear()
    cy.get('#lastName').clear()
    cy.get('#email').clear()

    // Intentar guardar
    cy.get('#submit').click()

    // Verificar que permanecemos en la página de edición
    cy.url().should('include', '/editContact')
  })

  it('should preserve unchanged fields during edit', () => {
    // Acceder al contacto para editar
    cy.contains(`${testContact.firstName} ${testContact.lastName}`).click()
    cy.get('#edit-contact').click()

    // Cambiar solo un campo
    const newPhone = '5552222222'
    cy.get('#phone').clear().type(newPhone)
    cy.get('#submit').click()

    // Verificar en detalles que otros campos se mantuvieron
    cy.contains(testContact.firstName).should('be.visible')
    cy.contains(testContact.lastName).should('be.visible')
    cy.contains(testContact.email).should('be.visible')
    cy.contains(newPhone).should('be.visible')
    cy.contains(testContact.city).should('be.visible')
  })

  it('should allow editing contact email to unique value', () => {
    // Acceder al contacto para editar
    cy.contains(`${testContact.firstName} ${testContact.lastName}`).click()
    cy.get('#edit-contact').click()

    // Cambiar email a uno único
    const newEmail = `updated${Date.now()}@newemail.com`
    cy.get('#email').clear().type(newEmail)
    cy.get('#submit').click()

    // Verificar que se guardó el nuevo email
    cy.url().should('include', '/contactDetails')
    cy.contains(newEmail).should('be.visible')
  })

  it('should handle cancellation of edit operation', () => {
    // Acceder al contacto para editar
    cy.contains(`${testContact.firstName} ${testContact.lastName}`).click()
    cy.get('#edit-contact').click()
    cy.url().should('include', '/editContact')

    // Hacer algunos cambios
    cy.get('#firstName').clear().type('ShouldNotSave')
    cy.get('#phone').clear().type('0000000000')

    // Cancelar (volver sin guardar)
    cy.get('#cancel').click()

    // Verificar que volvemos a detalles sin cambios
    cy.url().should('include', '/contactDetails')
    cy.contains(testContact.firstName).should('be.visible')
    cy.contains(testContact.phone).should('be.visible')
    cy.contains('ShouldNotSave').should('not.exist')
  })
})
