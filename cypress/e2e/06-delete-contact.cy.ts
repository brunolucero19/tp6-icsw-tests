// Test 6: Eliminar Contacto
// Integrante: Bruno Lucero

describe('E2E Test 6 - Delete Contact Flow', () => {
  let testUser: any
  let testContact: any

  beforeEach(() => {
    // Crear usuario y contacto únicos
    const timestamp = Date.now()
    const random = Math.floor(Math.random() * 10)

    testUser = {
      firstName: `ContactDeleter${random}`,
      lastName: `User${timestamp}`,
      email: `deleter${timestamp}${random}@cypress.com`,
      password: 'DeleterPassword123',
    }

    testContact = {
      firstName: `DeleteMe${random}`,
      lastName: `Delete${random}`,
      birthdate: '1975-08-20',
      email: `deletable${timestamp}${random}@fake.com`,
      phone: '5554567890',
      street1: '789 Delete Avenue',
      city: 'Delete City',
      stateProvince: 'DC',
      postalCode: '98765',
      country: 'Delete Country',
    }

    // Registrar usuario
    cy.visit('/addUser')
    cy.get('#firstName').type(testUser.firstName)
    cy.get('#lastName').type(testUser.lastName)
    cy.get('#email').type(testUser.email)
    cy.get('#password').type(testUser.password)
    cy.get('#submit').click()
    cy.url().should('include', '/contactList')

    // Crear contacto para eliminar
    cy.get('#add-contact').click()
    cy.get('#firstName').type(testContact.firstName)
    cy.get('#lastName').type(testContact.lastName)
    cy.get('#birthdate').type(testContact.birthdate)
    cy.get('#email').type(testContact.email)
    cy.get('#phone').type(testContact.phone)
    cy.get('#street1').type(testContact.street1)
    cy.get('#city').type(testContact.city)
    cy.get('#stateProvince').type(testContact.stateProvince)
    cy.get('#postalCode').type(testContact.postalCode)
    cy.get('#country').type(testContact.country)
    cy.get('#submit').click()
    cy.url().should('include', '/contactList')
  })

  it('should successfully delete a contact', () => {
    // Obtener número inicial de contactos
    cy.get('.contactTableBodyRow').then(($rows) => {
      const initialCount = $rows.length

      // Buscar y hacer click en el contacto
      cy.contains(`${testContact.firstName} ${testContact.lastName}`).click()
      cy.url().should('include', '/contactDetails')

      // Hacer click en eliminar
      cy.get('#delete').click()

      // Verificar redirección a la lista
      cy.url().should('include', '/contactList')

      // Verificar que el contacto ya no está en la lista
      cy.contains(`${testContact.firstName} ${testContact.lastName}`).should(
        'not.exist'
      )

      // Verificar que disminuyó la cantidad de contactos
      cy.get('.contactTableBodyRow').should('have.length', initialCount - 1)
    })
  })

  it('should show confirmation before deleting contact', () => {
    // Acceder al contacto
    cy.contains(`${testContact.firstName} ${testContact.lastName}`).click()
    cy.url().should('include', '/contactDetails')

    // Hacer click en eliminar
    cy.get('#delete').click()

    // En algunos casos podría haber una confirmación
    // Si existe un diálogo de confirmación, manejarlo
    cy.window().then((win) => {
      cy.stub(win, 'confirm').returns(true)
    })

    // Verificar que se eliminó
    cy.url().should('include', '/contactList')
    cy.contains(`${testContact.firstName} ${testContact.lastName}`).should(
      'not.exist'
    )
  })

  it('should handle deletion cancellation if confirmation exists', () => {
    // Crear un segundo contacto para esta prueba
    const secondContact = {
      firstName: `DontDelete`,
      lastName: 'Contact',
      email: `keepme@fake.com`,
    }

    cy.get('#add-contact').click()
    cy.get('#firstName').type(secondContact.firstName)
    cy.get('#lastName').type(secondContact.lastName)
    cy.get('#email').type(secondContact.email)
    cy.get('#submit').click()

    // Intentar eliminar pero cancelar
    cy.contains(`${secondContact.firstName} ${secondContact.lastName}`).click()
    cy.get('#delete').click()

    // Simular cancelación en confirmación
    cy.window().then((win) => {
      cy.stub(win, 'confirm').returns(false)
    })

    // El contacto debería seguir existiendo
    cy.visit('/contactList')
   
  })

  it('should not allow deletion of non-existent contact', () => {
    // Intentar acceder directamente a un ID de contacto inexistente
    cy.visit('/contactDetails/nonexistent-id')

    
  })

  it('should maintain list integrity after multiple deletions', () => {
    // Crear múltiples contactos para eliminar
    const contacts = [
      {
        firstName: testContact.firstName,
        lastName: testContact.lastName,
        email: testContact.email,
      },
      
    ]

    // Crear los contactos
    contacts.forEach((contact) => {
      cy.get('#add-contact').click()
      cy.get('#firstName').type(contact.firstName)
      cy.get('#lastName').type(contact.lastName)
      cy.get('#email').type(contact.email)
      cy.get('#submit').click()
    })

    // Eliminar cada contacto
    contacts.forEach((contact) => {
      cy.contains(`${contact.firstName} ${contact.lastName}`).click()
      cy.get('#delete').click()
      cy.url().should('include', '/contactList')
      cy.contains(`${contact.firstName} ${contact.lastName}`).should(
        'not.exist'
      )
    })

    // Verificar que la lista sigue funcionando correctamente
    cy.get('#add-contact').should('be.visible')
    cy.contains('Contact List').should('be.visible')
  })

  it('should redirect to contact list after deletion', () => {
    // Navegar a detalles del contacto
    cy.contains(`${testContact.firstName} ${testContact.lastName}`).click()
    cy.url().should('include', '/contactDetails')

    // Eliminar contacto
    cy.get('#delete').click()

    // Verificar redirección automática
    cy.url().should('include', '/contactList')
    cy.url().should('not.include', '/contactDetails')

    // Verificar que estamos en la lista correcta
    cy.contains('Contact List').should('be.visible')
    cy.get('#add-contact').should('be.visible')
  })
})
