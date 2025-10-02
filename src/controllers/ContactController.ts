import { Request, Response } from 'express'
import { contactModel } from '../models/Contact'
import { CreateContactRequest, UpdateContactRequest } from '../types'
import { AuthenticatedRequest } from '../middleware/auth'

export class ContactController {
  /**
   * Obtener todos los contactos del usuario autenticado
   */
  static async getContacts(
    req: AuthenticatedRequest,
    res: Response
  ): Promise<void> {
    try {
      const userId = req.user?.id

      if (!userId) {
        res.status(401).json({ error: 'Usuario no autenticado' })
        return
      }

      const contacts = await contactModel.findByUserId(userId)

      res.json({
        message: 'Contactos obtenidos exitosamente',
        contacts,
        total: contacts.length,
      })
    } catch (error) {
      console.error('Error obteniendo contactos:', error)
      res.status(500).json({ error: 'Error interno del servidor' })
    }
  }

  /**
   * Obtener un contacto específico por ID
   */
  static async getContact(
    req: AuthenticatedRequest,
    res: Response
  ): Promise<void> {
    try {
      const userId = req.user?.id
      const { id } = req.params

      if (!userId) {
        res.status(401).json({ error: 'Usuario no autenticado' })
        return
      }

      const contact = await contactModel.findById(id, userId)

      if (!contact) {
        res.status(404).json({ error: 'Contacto no encontrado' })
        return
      }

      res.json({
        message: 'Contacto obtenido exitosamente',
        contact,
      })
    } catch (error) {
      console.error('Error obteniendo contacto:', error)
      res.status(500).json({ error: 'Error interno del servidor' })
    }
  }

  /**
   * Crear un nuevo contacto
   */
  static async createContact(
    req: AuthenticatedRequest,
    res: Response
  ): Promise<void> {
    try {
      const userId = req.user?.id

      if (!userId) {
        res.status(401).json({ error: 'Usuario no autenticado' })
        return
      }

      const contactData: CreateContactRequest = req.body

      // Convertir fecha de string a Date si está presente
      const contactToCreate = {
        ...contactData,
        userId,
        dateOfBirth: contactData.dateOfBirth
          ? new Date(contactData.dateOfBirth)
          : undefined,
      }

      const contact = await contactModel.create(contactToCreate)

      res.status(201).json({
        message: 'Contacto creado exitosamente',
        contact,
      })
    } catch (error) {
      console.error('Error creando contacto:', error)
      res.status(500).json({ error: 'Error interno del servidor' })
    }
  }

  /**
   * Actualizar un contacto existente
   */
  static async updateContact(
    req: AuthenticatedRequest,
    res: Response
  ): Promise<void> {
    try {
      const userId = req.user?.id
      const { id } = req.params

      if (!userId) {
        res.status(401).json({ error: 'Usuario no autenticado' })
        return
      }

      const updates: UpdateContactRequest = req.body

      // Verificar que el contacto existe y pertenece al usuario
      const existingContact = await contactModel.findById(id, userId)
      if (!existingContact) {
        res.status(404).json({ error: 'Contacto no encontrado' })
        return
      }

      // Convertir fecha de string a Date si está presente
      const updatesToApply = {
        ...updates,
        dateOfBirth: updates.dateOfBirth
          ? new Date(updates.dateOfBirth)
          : undefined,
      }

      const updatedContact = await contactModel.update(
        id,
        userId,
        updatesToApply
      )

      res.json({
        message: 'Contacto actualizado exitosamente',
        contact: updatedContact,
      })
    } catch (error) {
      console.error('Error actualizando contacto:', error)
      res.status(500).json({ error: 'Error interno del servidor' })
    }
  }

  /**
   * Eliminar un contacto
   */
  static async deleteContact(
    req: AuthenticatedRequest,
    res: Response
  ): Promise<void> {
    try {
      const userId = req.user?.id
      const { id } = req.params

      if (!userId) {
        res.status(401).json({ error: 'Usuario no autenticado' })
        return
      }

      // Verificar que el contacto existe y pertenece al usuario
      const existingContact = await contactModel.findById(id, userId)
      if (!existingContact) {
        res.status(404).json({ error: 'Contacto no encontrado' })
        return
      }

      const deleted = await contactModel.delete(id, userId)

      if (!deleted) {
        res.status(404).json({ error: 'Contacto no encontrado' })
        return
      }

      res.json({
        message: 'Contacto eliminado exitosamente',
      })
    } catch (error) {
      console.error('Error eliminando contacto:', error)
      res.status(500).json({ error: 'Error interno del servidor' })
    }
  }
}
