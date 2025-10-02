import nodemailer from 'nodemailer'

export interface EmailOptions {
  to: string
  subject: string
  text?: string
  html?: string
}

class EmailService {
  private transporter: nodemailer.Transporter

  constructor() {
    this.transporter = nodemailer.createTransport({
      service: process.env.EMAIL_SERVICE || 'gmail',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    })
  }

  async sendVerificationEmail(email: string, token: string): Promise<void> {
    const verificationUrl = `${process.env.BASE_URL}/verify-email/${token}`

    const mailOptions: EmailOptions = {
      to: email,
      subject: 'Verificación de Email - Contact Manager',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2>Verificación de Email</h2>
          <p>Gracias por registrarte en Contact Manager. Para completar tu registro, por favor haz clic en el siguiente enlace:</p>
          <a href="${verificationUrl}" style="background-color: #007bff; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; display: inline-block;">
            Verificar Email
          </a>
          <p>Si no puedes hacer clic en el botón, copia y pega la siguiente URL en tu navegador:</p>
          <p>${verificationUrl}</p>
          <p>Este enlace expirará en 24 horas.</p>
          <p>Si no solicitaste esta verificación, puedes ignorar este email.</p>
        </div>
      `,
    }

    if (process.env.NODE_ENV === 'test') {
      // En testing, solo logeamos el email
      console.log('Email enviado (modo test):', mailOptions)
      return
    }

    try {
      await this.transporter.sendMail(mailOptions)
    } catch (error) {
      console.error('Error enviando email:', error)
      throw new Error('Error enviando email de verificación')
    }
  }

  // Para testing - verificar configuración
  async verifyConnection(): Promise<boolean> {
    try {
      await this.transporter.verify()
      return true
    } catch (error) {
      return false
    }
  }
}

export const emailService = new EmailService()
