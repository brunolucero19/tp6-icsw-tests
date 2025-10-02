# 🧪 TP6 - Tests Automatizados Contact List

## Ingeniería y Calidad de Software - UTN

Este proyecto implementa una **estrategia completa de testing automatizado** para la aplicación Contact List, cubriendo tests unitarios, de integración y end-to-end (E2E).

### 🎯 **Aplicación Objetivo**

- **URL:** https://thinking-tester-contact-list.herokuapp.com/
- **Funcionalidad:** Sistema de gestión de contactos con autenticación

### 👥 **Integrantes del Grupo**

1. Octavio Díaz - Test E2E: Registro de Usuario
2. Vincenzo Dallape - Test E2E: Login de Usuario
3. Emiliano Jordán - Test E2E: Logout de Usuario
4. Matías Visedo - Test E2E: Crear Contacto
5. Valentino Isgró - Test E2E: Editar Contacto
6. Bruno Lucero - Test E2E: Eliminar Contacto
7. Juan Pablo Costa - Test E2E: Navegación y Validaciones

---

## 📋 **Requisitos del Sistema**

### Prerrequisitos

- **Node.js** v18+ (descargar desde [nodejs.org](https://nodejs.org/))
- **Git** (para clonar el repositorio)
- **Navegador moderno** (Chrome, Firefox, Edge)

### Verificar instalación

```bash
node --version    # Debe mostrar v18.x.x o superior
npm --version     # Debe mostrar 8.x.x o superior
git --version     # Cualquier versión reciente
```

---

## 🚀 **Setup del Proyecto**

### 1. **Clonar el Repositorio**

```bash
git clone https://github.com/brunolucero19/tp6-icsw-tests.git
cd tp6-icsw-tests
```

### 2. **Instalar Dependencias**

```bash
npm install
```

Este comando instalará todas las dependencias necesarias:

- Jest (testing framework)
- Cypress (E2E testing)
- TypeScript (tipado)
- Axios (HTTP requests)
- Y todas las dependencias adicionales

### 3. **Verificar Instalación**

```bash
npm run test:unit
```

Si todo está correcto, deberías ver algo como:

```
Test Suites: 7 passed, 7 total
Tests:       169 passed, 169 total
```

---

## 🧪 **Ejecutar Tests**

### **Tests Unitarios** (Recomendado empezar aquí)

```bash
# Ejecutar todos los tests unitarios
npm run test:unit

# Ejecutar con coverage
npm run test:coverage

# Ejecutar en modo watch (re-ejecuta al cambiar archivos)
npm run test:watch
```

### **Tests de Integración**

```bash
# Ejecutar tests contra API real
npm run test:integration
```

⚠️ **Nota:** Estos tests hacen llamadas HTTP reales y pueden tardar ~30 segundos.

### **Tests E2E con Cypress**

#### Opción 1: Modo Interactivo (Recomendado para desarrollo)

```bash
npm run cypress:open
```

- Se abre interfaz gráfica de Cypress
- Puedes seleccionar tests individuales
- Ver ejecución en tiempo real
- Ideal para debugging

#### Opción 2: Modo Headless (Para CI/CD)

```bash
npm run cypress:run
```

- Ejecuta todos los tests sin interfaz
- Genera videos y screenshots automáticamente
- Más rápido para ejecución completa

### **Ejecutar TODOS los Tests**

```bash
npm test
```

Ejecuta unitarios + integración + E2E en secuencia.

---

## 📁 **Estructura del Proyecto**

```
tp6-icsw-tests/
├── 📂 src/
│   ├── 📂 __tests__/
│   │   ├── 📂 unit/                    # Tests unitarios (169 tests)
│   │   │   ├── ValidationUtils.test.ts
│   │   │   ├── FormatUtils.test.ts
│   │   │   ├── ContactListApiService.test.ts
│   │   │   ├── AuthenticationFlow.test.ts
│   │   │   ├── UserRegistrationValidation.test.ts
│   │   │   ├── UserProfileManagement.test.ts
│   │   │   └── ContactManagement.test.ts
│   │   └── 📂 integration/             # Tests de integración (29 tests)
│   │       ├── UserRegistration.integration.test.ts
│   │       ├── UserLogin.integration.test.ts
│   │       ├── UserLogout.integration.test.ts
│   │       └── CompleteFlows.integration.test.ts
│   ├── 📂 services/
│   │   └── ContactListApiService.ts    # Cliente API principal
│   ├── 📂 utils/
│   │   ├── ValidationUtils.ts          # Utilidades de validación
│   │   └── FormatUtils.ts             # Utilidades de formateo
│   └── 📂 types/
│       └── api.types.ts               # Tipos TypeScript
├── 📂 cypress/
│   ├── 📂 e2e/                        # Tests E2E (36 tests)
│   │   ├── 01-user-registration.cy.ts  # Registro usuario
│   │   ├── 02-user-login.cy.ts         # Login usuario
│   │   ├── 03-user-logout.cy.ts        # Logout usuario
│   │   ├── 04-create-contact.cy.ts     # Crear contacto
│   │   ├── 05-edit-contact.cy.ts       # Editar contacto
│   │   ├── 06-delete-contact.cy.ts     # Eliminar contacto
│   │   └── 07-navigation-validation.cy.ts # Navegación
│   ├── 📂 support/
│   │   ├── commands.ts                 # Comandos personalizados
│   │   └── e2e.ts                     # Configuración global
│   └── 📂 fixtures/
│       └── testData.json              # Datos de prueba
├── 📂 coverage/                        # Reportes de cobertura
├── 📄 cypress.config.ts               # Configuración Cypress
├── 📄 jest.config.js                  # Configuración Jest
├── 📄 package.json                    # Dependencias y scripts
└── 📄 INFORME_FINAL_TP6.md           # Informe completo
```

---

## 🎯 **Tests por Categoria**

### **Item 3: Tests Unitarios** ✅

- **169 tests** con **100% cobertura**
- Valida lógica de negocio aislada
- Mocks para dependencias externas
- Ejecución rápida (~9 segundos)

### **Item 4: Tests de Integración** ✅

- **29 tests** contra **API real**
- Valida flujos completos end-to-end
- Registro → Login → Logout
- Gestión completa de contactos

### **Item 5: Tests E2E Cypress** ✅

- **7 tests automatizados** (uno por integrante)
- **36 casos de prueba** total
- Interfaz de usuario real
- Videos y screenshots automáticos

---

## 🔧 **Scripts Disponibles**

| Script           | Comando                    | Descripción                  |
| ---------------- | -------------------------- | ---------------------------- |
| Test unitarios   | `npm run test:unit`        | Solo tests unitarios         |
| Test integración | `npm run test:integration` | Tests contra API real        |
| Coverage         | `npm run test:coverage`    | Tests + reporte cobertura    |
| Watch mode       | `npm run test:watch`       | Re-ejecuta al cambiar código |
| Cypress UI       | `npm run cypress:open`     | Interfaz gráfica Cypress     |
| Cypress headless | `npm run cypress:run`      | Cypress en terminal          |
| E2E              | `npm run test:e2e`         | Alias para cypress:run       |
| Todos            | `npm test`                 | Todos los tests              |

---

## 📊 **Resultados Esperados**

### **Tests Unitarios**

```
Test Suites: 7 passed, 7 total
Tests:       169 passed, 169 total
Coverage:    100% (Statements, Branches, Functions, Lines)
Time:        ~9 seconds
```

### **Tests de Integración**

```
Test Suites: 4 passed, 4 total
Tests:       29 passed, 29 total
Time:        ~32 seconds
```

### **Tests E2E Cypress**

```
Specs:       7 archivos
Tests:       36 implementados
Passing:     19+ tests (mejorando continuamente)
Time:        ~8 minutos
```

---

## 🐛 **Troubleshooting**

### Problemas Comunes

#### 1. **Error al instalar dependencias**

```bash
# Limpiar cache y reinstalar
rm -rf node_modules package-lock.json
npm cache clean --force
npm install
```

#### 2. **Tests de integración fallan**

- Verificar conexión a internet
- La API externa puede estar temporalmente inactiva
- Esperar y reintentar

#### 3. **Cypress no abre**

```bash
# Verificar instalación de Cypress
npx cypress verify

# Reinstalar Cypress si es necesario
npm uninstall cypress
npm install cypress --save-dev
```

#### 4. **Tests E2E fallan**

- La aplicación web puede haber cambiado
- Verificar que la URL base funcione en navegador
- Algunos tests pueden necesitar ajuste de selectores

#### 5. **Errores de TypeScript**

```bash
# Verificar configuración TypeScript
npx tsc --noEmit

# Reinstalar tipos si es necesario
npm install --save-dev @types/node @types/jest
```

---

## 🚀 **Para Desarrolladores**

### **Agregar Nuevos Tests**

#### Test Unitario

1. Crear archivo en `src/__tests__/unit/`
2. Seguir convención `NombreDelModulo.test.ts`
3. Usar Jest y mocks

#### Test de Integración

1. Crear archivo en `src/__tests__/integration/`
2. Usar axios para HTTP real
3. Generar datos únicos

#### Test E2E

1. Crear archivo en `cypress/e2e/`
2. Seguir convención `##-descripcion.cy.ts`
3. Usar comandos personalizados de `cypress/support/commands.ts`

### **Comandos de Desarrollo**

```bash
# Ejecutar test específico
npm test -- ValidationUtils.test.ts

# Debug con breakpoints
npm run test:unit -- --inspect-brk

# Coverage HTML detallado
npm run test:coverage && open coverage/lcov-report/index.html
```

---

## 📈 **Métricas del Proyecto**

| Métrica       | Unitarios | Integración | E2E | **Total** |
| ------------- | --------- | ----------- | --- | --------- |
| **Tests**     | 169       | 29          | 36  | **234**   |
| **Suites**    | 7         | 4           | 7   | **18**    |
| **Tiempo**    | 9s        | 32s         | 8m  | **9m**    |
| **Cobertura** | 100%      | N/A         | N/A | **100%**  |

---

## 🎓 **Tecnologías Utilizadas**

### **Testing Frameworks**

- **Jest** - Tests unitarios e integración
- **Cypress** - Tests E2E de interfaz

### **Lenguajes y Tools**

- **TypeScript** - Tipado fuerte
- **Node.js** - Runtime JavaScript
- **Axios** - Cliente HTTP
- **Git** - Control de versiones

### **APIs y Servicios**

- **Contact List API** - Aplicación objetivo
- **Heroku** - Hosting de la aplicación

---

## 📞 **Soporte**

### **Para el Equipo**

Si tienes problemas:

1. **Verifica prerrequisitos** (Node.js, npm)
2. **Consulta troubleshooting** arriba
3. **Revisa issues** en GitHub
4. **Contacta al equipo** en el grupo

### **Recursos Útiles**

- [Jest Documentation](https://jestjs.io/docs/getting-started)
- [Cypress Documentation](https://docs.cypress.io/)
- [Contact List App](https://thinking-tester-contact-list.herokuapp.com/)

---

## ✅ **Checklist para Nuevos Desarrolladores**

- [ ] Node.js v18+ instalado
- [ ] Repositorio clonado
- [ ] `npm install` ejecutado exitosamente
- [ ] `npm run test:unit` pasa todos los tests
- [ ] `npm run test:integration` funciona
- [ ] `npm run cypress:open` abre interfaz
- [ ] Leído `INFORME_FINAL_TP6.md`

---

**🎯 ¡Listo para empezar!** Una vez completado el checklist, tendrás todo funcionando y podrás contribuir al proyecto.

---

_Proyecto desarrollado para la materia **Ingeniería y Calidad de Software** - UTN - Octubre 2025_
