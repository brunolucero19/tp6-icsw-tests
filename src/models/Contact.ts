import { Contact } from '../types'

class ContactModel {
  private contacts: Contact[] = []

  async findByUserId(userId: string): Promise<Contact[]> {
    return this.contacts.filter((c) => c.userId === userId)
  }

  async findById(id: string, userId: string): Promise<Contact | null> {
    const contact = this.contacts.find(
      (c) => c.id === id && c.userId === userId
    )
    return contact || null
  }

  async create(
    contactData: Omit<Contact, 'id' | 'createdAt' | 'updatedAt'>
  ): Promise<Contact> {
    const contact: Contact = {
      id: this.generateId(),
      ...contactData,
      createdAt: new Date(),
      updatedAt: new Date(),
    }

    this.contacts.push(contact)
    return contact
  }

  async update(
    id: string,
    userId: string,
    updates: Partial<Contact>
  ): Promise<Contact | null> {
    const contactIndex = this.contacts.findIndex(
      (c) => c.id === id && c.userId === userId
    )
    if (contactIndex === -1) return null

    this.contacts[contactIndex] = {
      ...this.contacts[contactIndex],
      ...updates,
      updatedAt: new Date(),
    }

    return this.contacts[contactIndex]
  }

  async delete(id: string, userId: string): Promise<boolean> {
    const contactIndex = this.contacts.findIndex(
      (c) => c.id === id && c.userId === userId
    )
    if (contactIndex === -1) return false

    this.contacts.splice(contactIndex, 1)
    return true
  }

  private generateId(): string {
    return Date.now().toString() + Math.random().toString(36).substr(2, 9)
  }

  // Para testing - resetear datos
  async clear(): Promise<void> {
    this.contacts = []
  }

  // Para testing - obtener todos los contactos
  async findAll(): Promise<Contact[]> {
    return [...this.contacts]
  }
}

export const contactModel = new ContactModel()
