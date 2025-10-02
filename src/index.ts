import express from 'express'
import cors from 'cors'
import dotenv from 'dotenv'

// Importar rutas
import authRoutes from './routes/auth'
import contactRoutes from './routes/contacts'

// Cargar variables de entorno
dotenv.config()

const app = express()
const PORT = process.env.PORT || 3001

// Middleware global
app.use(
  cors({
    origin:
      process.env.NODE_ENV === 'production'
        ? process.env.FRONTEND_URL
        : ['http://localhost:3000', 'http://127.0.0.1:3000'],
    credentials: true,
  })
)

app.use(express.json({ limit: '10mb' }))
app.use(express.urlencoded({ extended: true }))

// Middleware de logging
app.use((req, res, next) => {
  if (process.env.NODE_ENV !== 'test') {
    console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`)
  }
  next()
})

// Rutas principales
app.use('/api/auth', authRoutes)
app.use('/api/contacts', contactRoutes)

// Ruta de salud
app.get('/api/health', (req, res) => {
  res.json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development',
  })
})

// Ruta por defecto
app.get('/', (req, res) => {
  res.json({
    message: 'Contact Manager API',
    version: '1.0.0',
    endpoints: {
      auth: '/api/auth',
      contacts: '/api/contacts',
      health: '/api/health',
    },
  })
})

// Middleware de manejo de errores 404
app.use('*', (req, res) => {
  res.status(404).json({
    error: 'Ruta no encontrada',
    message: `La ruta ${req.method} ${req.originalUrl} no existe`,
  })
})

// Middleware de manejo de errores global
app.use(
  (
    err: any,
    req: express.Request,
    res: express.Response,
    next: express.NextFunction
  ) => {
    console.error('Error no manejado:', err)

    res.status(err.status || 500).json({
      error: 'Error interno del servidor',
      message:
        process.env.NODE_ENV === 'development' ? err.message : 'Algo salió mal',
      ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
    })
  }
)

// Iniciar servidor solo si no estamos en testing
if (process.env.NODE_ENV !== 'test') {
  app.listen(PORT, () => {
    console.log(`🚀 Servidor ejecutándose en puerto ${PORT}`)
    console.log(`📍 Entorno: ${process.env.NODE_ENV || 'development'}`)
    console.log(`🌐 URL: http://localhost:${PORT}`)
  })
}

export default app
