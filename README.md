# Contact Manager - Backend

API REST para gestión de contactos personales con autenticación JWT.

## Características

- 🔐 Autenticación JWT con verificación de email
- 📝 CRUD completo de contactos
- 🔒 Validaciones de seguridad (hash de contraseñas, validación de datos)
- 📧 Servicio de envío de emails para verificación
- 🧪 Tests unitarios comprehensivos con Jest
- 📊 Cobertura de código
- 🚀 API REST documentada

## Tecnologías

- **Node.js** + **Express** - Servidor web
- **TypeScript** - Tipado estático
- **bcrypt** - Hash de contraseñas
- **JWT** - Autenticación
- **nodemailer** - Envío de emails
- **express-validator** - Validaciones
- **Jest** + **Supertest** - Testing
- **ESLint** - Linting

## Instalación

```bash
# Instalar dependencias
npm install

# Copiar archivo de configuración
cp .env.example .env

# Editar variables de entorno
# Configurar EMAIL_USER y EMAIL_PASS para el servicio de emails
```

## Scripts Disponibles

```bash
# Desarrollo con recarga automática
npm run dev

# Compilar TypeScript
npm run build

# Ejecutar en producción
npm start

# Ejecutar tests
npm test

# Tests en modo watch
npm run test:watch

# Cobertura de tests
npm run test:coverage

# Linting
npm run lint
npm run lint:fix
```

## Variables de Entorno

Crear archivo `.env` basado en `.env.example`:

```env
NODE_ENV=development
PORT=3001
JWT_SECRET=tu_jwt_secret_super_seguro
EMAIL_SERVICE=gmail
EMAIL_USER=tu_email@gmail.com
EMAIL_PASS=tu_password_de_aplicacion
BASE_URL=http://localhost:3000
```

### Configuración de Email

Para usar Gmail como servicio de email:

1. Activar autenticación de 2 factores en tu cuenta Gmail
2. Generar una contraseña de aplicación específica
3. Usar esa contraseña en `EMAIL_PASS`

## API Endpoints

### Autenticación

```
POST   /api/auth/register        # Registro de usuario
POST   /api/auth/login           # Inicio de sesión
GET    /api/auth/verify-email/:token  # Verificación de email
GET    /api/auth/profile         # Perfil del usuario (requiere auth)
```

### Contactos (requieren autenticación)

```
GET    /api/contacts             # Obtener todos los contactos
GET    /api/contacts/:id         # Obtener contacto específico
POST   /api/contacts             # Crear nuevo contacto
PUT    /api/contacts/:id         # Actualizar contacto
DELETE /api/contacts/:id         # Eliminar contacto
```

### Otros

```
GET    /api/health               # Estado del servidor
GET    /                         # Información de la API
```

## Estructura del Proyecto

```
src/
├── controllers/     # Controladores de las rutas
├── middleware/      # Middleware personalizado
├── models/          # Modelos de datos (en memoria)
├── routes/          # Definición de rutas
├── services/        # Servicios (email, etc.)
├── types/           # Tipos TypeScript
├── utils/           # Utilidades
├── __tests__/       # Tests unitarios
└── index.ts         # Punto de entrada
```

## Testing

### Ejecutar Tests

```bash
# Todos los tests
npm test

# Tests específicos
npm test -- auth.test.ts

# Cobertura
npm run test:coverage
```

### Estructura de Tests

- `__tests__/utils/` - Tests de utilidades
- `__tests__/models/` - Tests de modelos
- `__tests__/controllers/` - Tests de controladores (integración)
- `__tests__/setup.ts` - Configuración global de tests

## Casos de Uso Cubiertos

### Registro de Usuario

- ✅ Validación de email y contraseña
- ✅ Confirmación de contraseña
- ✅ Hash seguro de contraseñas
- ✅ Envío de email de verificación
- ✅ Prevención de emails duplicados

### Inicio de Sesión

- ✅ Validación de credenciales
- ✅ Verificación de email confirmado
- ✅ Generación de JWT
- ✅ Manejo de errores

### Gestión de Contactos

- ✅ CRUD completo con autorización
- ✅ Validación de datos de entrada
- ✅ Aislamiento por usuario
- ✅ Campos opcionales

### Seguridad

- ✅ JWT con expiración
- ✅ Middleware de autenticación
- ✅ Validación y sanitización de datos
- ✅ Prevención de ataques básicos

## Desarrollo

### Agregar Nueva Funcionalidad

1. Crear tipos en `types/`
2. Implementar modelo en `models/`
3. Crear controlador en `controllers/`
4. Definir rutas en `routes/`
5. Agregar validaciones en `middleware/`
6. Escribir tests en `__tests__/`

### Convenciones

- Usar TypeScript estricto
- Validar todas las entradas
- Manejar errores correctamente
- Escribir tests para nueva funcionalidad
- Documentar APIs con comentarios

## Producción

```bash
# Compilar
npm run build

# Configurar variables de entorno de producción
export NODE_ENV=production
export JWT_SECRET=secret_muy_seguro_production
export EMAIL_USER=email_production
export EMAIL_PASS=password_production

# Ejecutar
npm start
```

## Contribuir

1. Fork del proyecto
2. Crear rama feature (`git checkout -b feature/nueva-funcionalidad`)
3. Escribir tests
4. Commit cambios (`git commit -am 'Agregar nueva funcionalidad'`)
5. Push a la rama (`git push origin feature/nueva-funcionalidad`)
6. Crear Pull Request
