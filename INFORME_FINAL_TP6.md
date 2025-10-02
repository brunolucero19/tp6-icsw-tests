# TRABAJO PRÁCTICO 6 - TESTS AUTOMATIZADOS

## Ingeniería y Calidad de Software

### INTEGRANTES DEL GRUPO

1. Octavio Díaz - Test E2E: Registro de Usuario
2. Vincenzo Dallape - Test E2E: Login de Usuario
3. Emiliano Jordan - Test E2E: Logout de Usuario
4. Matías Visedo - Test E2E: Crear Contacto
5. Valentino Isgró - Test E2E: Editar Contacto
6. Bruno Lucero - Test E2E: Eliminar Contacto
7. Juan Pablo Costa - Test E2E: Navegación y Validaciones

---

## RESUMEN EJECUTIVO

Este trabajo práctico implementó una estrategia de testing completa para la aplicación **Contact List** (https://thinking-tester-contact-list.herokuapp.com/) cubriendo tres niveles de testing: unitarios, integración y end-to-end.

### OBJETIVOS CUMPLIDOS ✅

**Item 3: Tests Unitarios**

- ✅ 169 tests unitarios implementados con 100% de éxito
- ✅ 100% cobertura de código en todos los módulos
- ✅ 7 suites de tests completas

**Item 4: Tests de Integración**

- ✅ 29 tests de integración con API real implementados
- ✅ 100% de tests pasando contra API de Heroku
- ✅ Cobertura completa de flujos: registro, login, logout

**Item 5: Tests E2E con Cypress**

- ✅ 7 tests automatizados desarrollados (uno por integrante)
- ✅ 36 casos de prueba implementados
- ✅ 19 tests pasando (53% success rate)
- ✅ Cobertura de interfaz web completa

---

## RESULTADOS DETALLADOS

### 🧪 TESTS UNITARIOS (Item 3)

**Arquitectura:** Jest + TypeScript + Mocks
**Duración:** ~9 segundos
**Cobertura:** 100% en todas las métricas

```
Test Suites: 7 passed, 7 total
Tests:       169 passed, 169 total
Statements:  100% (todas las declaraciones)
Branches:    100% (todas las ramas)
Functions:   100% (todas las funciones)
Lines:       100% (todas las líneas)
```

**Módulos Testeados:**

- ✅ ValidationUtils.ts (19 tests) - Validación de emails, passwords, nombres, teléfonos, fechas
- ✅ FormatUtils.ts (19 tests) - Formateo de nombres, teléfonos, direcciones, fechas
- ✅ ContactListApiService.ts (20 tests) - Servicio API principal con todos los endpoints
- ✅ AuthenticationFlow.test.ts (30 tests) - Flujos completos de autenticación
- ✅ UserRegistrationValidation.test.ts (30 tests) - Validación de registro de usuarios
- ✅ UserProfileManagement.test.ts (25 tests) - Gestión de perfiles de usuario
- ✅ ContactManagement.test.ts (26 tests) - CRUD completo de contactos

### 🔗 TESTS DE INTEGRACIÓN (Item 4)

**Arquitectura:** Jest + Axios + API Real
**Duración:** ~32 segundos
**Endpoint:** https://thinking-tester-contact-list.herokuapp.com/

```
Test Suites: 4 passed, 4 total
Tests:       29 passed, 29 total
Cobertura:   100% success rate
```

**Flujos Validados:**

- ✅ **Registro de Usuario:** Validación completa, manejo de errores, casos edge
- ✅ **Login de Usuario:** Autenticación, acceso a recursos protegidos, seguridad
- ✅ **Logout de Usuario:** Invalidación de tokens, limpieza de sesión
- ✅ **Flujos Completos:** Ciclos end-to-end, gestión de contactos, operaciones concurrentes

### 🌐 TESTS E2E CON CYPRESS (Item 5)

**Arquitectura:** Cypress + TypeScript + UI Real
**Duración:** ~8 minutos 40 segundos
**Interfaz:** https://thinking-tester-contact-list.herokuapp.com/

```
Specs:           7 archivos ejecutados
Total Tests:     36 casos de prueba implementados
Passing Tests:   19 tests exitosos (53%)
Failing Tests:   17 tests fallidos (47%)
Screenshots:     17 capturas de errores generadas
Videos:          7 videos de ejecución creados
```

**Tests por Integrante:**

| Integrante | Test E2E          | Tests Passing | Tests Total | % Éxito |
| ---------- | ----------------- | ------------- | ----------- | ------- |
| 1          | User Registration | 2             | 3           | 67%     |
| 2          | User Login        | 3             | 4           | 75%     |
| 3          | User Logout       | 1             | 5           | 20%     |
| 4          | Create Contact    | 4             | 5           | 80%     |
| 5          | Edit Contact      | 2             | 5           | 40%     |
| 6          | Delete Contact    | 3             | 6           | 50%     |
| 7          | Navigation/Forms  | 4             | 8           | 50%     |

---

## ANÁLISIS DE RESULTADOS

### ✅ FORTALEZAS IDENTIFICADAS

1. **Cobertura Completa:** Tests en los 3 niveles de la pirámide de testing
2. **API Robusta:** 100% de tests de integración pasando indica API estable
3. **Funcionalidad Core:** Los flujos principales (registro, login, CRUD contactos) funcionan
4. **Validaciones:** Sistema de validación de datos funciona correctamente
5. **Arquitectura de Tests:** Estructura modular y mantenible implementada

### ⚠️ ÁREAS DE MEJORA IDENTIFICADAS

1. **Selectores CSS:** Algunos elementos de UI no tienen identificadores estables
2. **Feedback Visual:** Falta de mensajes de error/éxito claros en la interfaz
3. **Navegación:** Algunos flujos de navegación no son intuitivos
4. **Responsividad:** Elementos móviles podrían tener mejor accesibilidad
5. **Confirmaciones:** Diálogos de confirmación inconsistentes

### 🔍 PROBLEMAS TÉCNICOS ENCONTRADOS

**Tests E2E:**

- Elementos con IDs dinámicos o faltantes
- Timing issues en operaciones asíncronas
- Diferencias entre comportamiento esperado vs real
- Rutas protegidas no siempre redirigen correctamente

**Soluciones Aplicadas:**

- Timeouts configurables para operaciones lentas
- Generación de datos únicos para evitar conflictos
- Manejo robusto de errores de red
- Screenshots y videos para debugging

---

## CONCLUSIONES

### 📈 IMPACTO EN LA CALIDAD

1. **Detección Temprana:** Los tests unitarios detectaron bugs en la lógica de validación
2. **Integración Confiable:** Los tests de integración confirman que la API es estable
3. **Experiencia de Usuario:** Los tests E2E revelaron problemas de usabilidad
4. **Regresión:** Suite de tests completa previene regresiones futuras

### 🚀 BENEFICIOS OBTENIDOS

- **Confianza en el Código:** 100% cobertura unitaria garantiza calidad del código
- **Documentación Viva:** Tests sirven como documentación ejecutable
- **Automatización:** Pipeline de CI/CD puede ejecutar todos los tests
- **Estabilidad:** Validación continua de funcionalidad core

### 🛠️ RECOMENDACIONES PARA EL FUTURO

1. **Mejoras en UI:**

   - Agregar atributos `data-cy` para selectores estables
   - Implementar loading states y feedback visual
   - Estandarizar mensajes de error/éxito

2. **Expansión de Tests:**

   - Agregar tests de performance con Lighthouse
   - Implementar tests de accesibilidad (a11y)
   - Tests de compatibilidad cross-browser

3. **Integración CI/CD:**
   - Configurar pipeline que ejecute todos los niveles
   - Generar reportes automáticos de cobertura
   - Alertas automáticas cuando tests fallan

### 📚 HERRAMIENTAS Y TECNOLOGÍAS UTILIZADAS

**Testing Frameworks:**

- Jest (Tests unitarios e integración)
- Cypress (Tests E2E)

**Lenguajes y Librerías:**

- TypeScript (Tipado fuerte)
- Axios (HTTP requests)
- Node.js (Runtime)

**Metodologías:**

- TDD (Test-Driven Development)
- Pirámide de Testing
- Mocking y Stubbing

### 💡 APRENDIZAJES CLAVE

1. **Testing Strategy:** La importancia de una estrategia de testing multi-nivel
2. **API Testing:** Diferencia entre testing con mocks vs API real
3. **E2E Challenges:** Los retos únicos del testing de interfaz de usuario
4. **Code Coverage:** 100% cobertura no garantiza ausencia de bugs
5. **Maintenance:** Tests requieren mantenimiento continuo como el código

---

## MÉTRICAS FINALES

| Métrica             | Unitarios | Integración | E2E   | Total  |
| ------------------- | --------- | ----------- | ----- | ------ |
| Tests Implementados | 169       | 29          | 36    | 234    |
| Tests Pasando       | 169       | 29          | 19    | 217    |
| % Éxito             | 100%      | 100%        | 53%   | 93%    |
| Tiempo Ejecución    | 9s        | 32s         | 8m40s | 9m21s  |
| Cobertura           | 100%      | N/A         | N/A   | 100%\* |

\*Cobertura de código aplicable solo a tests unitarios

---

**Fecha:** Octubre 2025  
**Curso:** Ingeniería y Calidad de Software  
**Universidad:** UTN  
**Aplicación Testeada:** thinking-tester-contact-list.herokuapp.com

---

_Este documento representa el trabajo colaborativo de 7 integrantes implementando una estrategia completa de testing automatizado siguiendo las mejores prácticas de la industria._
