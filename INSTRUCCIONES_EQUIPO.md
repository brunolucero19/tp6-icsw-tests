# 🚀 INSTRUCCIONES RÁPIDAS PARA EL EQUIPO

## ⚡ Setup Rápido (5 minutos)

### 1. **Clonar y Configurar**

```bash
git clone https://github.com/brunolucero19/tp6-icsw-tests.git
cd tp6-icsw-tests
npm install
```

### 2. **Verificar que Todo Funciona**

```bash
npm run test:unit
```

✅ Deberías ver: `Tests: 169 passed, 169 total`

---

## 🧪 **Comandos Esenciales**

### **Para probar TU test E2E:**

```bash
# Abrir interfaz de Cypress (RECOMENDADO)
npm run cypress:open

# Ejecutar todos los E2E en terminal
npm run cypress:run
```

### **Tests Rápidos:**

```bash
npm run test:unit         # Tests unitarios (9 segundos)
npm run test:integration  # Tests API real (30 segundos)
npm test                  # TODOS los tests
```

---

## 🎯 **Tu Test E2E Individual**

Cada integrante tiene asignado **un archivo específico**:

| Integrante | Tu Archivo                       | Función             |
| ---------- | -------------------------------- | ------------------- |
| 1          | `01-user-registration.cy.ts`     | Registro de usuario |
| 2          | `02-user-login.cy.ts`            | Login de usuario    |
| 3          | `03-user-logout.cy.ts`           | Logout de usuario   |
| 4          | `04-create-contact.cy.ts`        | Crear contacto      |
| 5          | `05-edit-contact.cy.ts`          | Editar contacto     |
| 6          | `06-delete-contact.cy.ts`        | Eliminar contacto   |
| 7          | `07-navigation-validation.cy.ts` | Navegación          |

### **Para trabajar en TU test:**

1. **Encontrar tu archivo:**

   ```bash
   # Tu archivo está en:
   cypress/e2e/[TU-NUMERO]-[TU-FUNCIONALIDAD].cy.ts
   ```

2. **Ejecutar SOLO tu test:**

   ```bash
   npx cypress open
   # Seleccionar TU archivo específico
   ```

3. **Ver resultados:**
   - ✅ Tests pasando = Funcionalidad OK
   - ❌ Tests fallando = Necesita ajustes

---

## 🔧 **Si Algo No Funciona**

### **Problema: npm install falla**

```bash
rm -rf node_modules
npm cache clean --force
npm install
```

### **Problema: Cypress no abre**

```bash
npx cypress verify
```

### **Problema: Tests fallan**

- Es normal que algunos E2E fallen al principio
- La app web real puede tener diferencias
- Foco en que TU test específico funcione

---

## 📝 **Para Entregar**

### **Lo que necesitas hacer:**

1. ✅ Ejecutar TU test E2E específico
2. ✅ Capturar pantalla de resultados
3. ✅ Reportar si funciona o qué falla
4. ✅ (Opcional) Mejorar tu test si hay tiempo

### **Evidencia a presentar:**

- Screenshot de Cypress corriendo tu test
- Video generado automáticamente (en `cypress/videos/`)
- Nota sobre qué funciona/falla

---

## 🆘 **Ayuda Rápida**

### **¿No tienes Node.js?**

1. Ir a https://nodejs.org/
2. Descargar LTS (recomendado)
3. Instalar con opciones por defecto
4. Reiniciar terminal

### **¿Primer uso de Git?**

```bash
git config --global user.name "Tu Nombre"
git config --global user.email "tu@email.com"
```

### **¿Dudas con Cypress?**

- Ejecutar `npm run cypress:open`
- Es muy visual e intuitivo
- Puedes ver la ejecución en tiempo real

---

## ⭐ **Tips para el Éxito**

1. **Empieza con:** `npm run test:unit` (siempre funciona)
2. **Luego prueba:** `npm run test:integration`
3. **Finalmente:** `npm run cypress:open` (tu test)
4. **Si algo falla:** No te preocupes, es normal en E2E
5. **Foco:** Que TU test específico funcione bien

---

**🎯 ¡En 5 minutos deberías tener todo corriendo!**

_Cualquier duda, preguntar en el grupo 💬_
