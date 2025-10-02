@echo off
echo.
echo ===================================
echo   🚀 VERIFICACION RAPIDA DEL SETUP
echo ===================================
echo.

echo ⏳ Verificando Node.js...
node --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ Node.js no está instalado
    echo.
    echo 💡 Solución:
    echo    1. Ir a https://nodejs.org/
    echo    2. Descargar e instalar la versión LTS
    echo    3. Reiniciar el terminal
    echo.
    pause
    exit /b 1
) else (
    echo ✅ Node.js instalado correctamente
)

echo.
echo ⏳ Verificando dependencias...
if not exist "node_modules" (
    echo ❌ Dependencias no instaladas
    echo.
    echo 💡 Ejecutando npm install...
    npm install
    if %errorlevel% neq 0 (
        echo ❌ Error instalando dependencias
        pause
        exit /b 1
    )
) else (
    echo ✅ Dependencias instaladas
)

echo.
echo ⏳ Ejecutando tests unitarios...
npm run test:unit >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ Tests unitarios fallaron
    echo.
    echo 💡 Intenta:
    echo    npm run test:unit
    echo.
    pause
    exit /b 1
) else (
    echo ✅ Tests unitarios funcionando (169 tests)
)

echo.
echo ⏳ Verificando Cypress...
npx cypress verify >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ Cypress no está configurado correctamente
    echo.
    echo 💡 Intenta:
    echo    npx cypress install
    echo.
    pause
    exit /b 1
) else (
    echo ✅ Cypress configurado correctamente
)

echo.
echo ===================================
echo     🎉 TODO LISTO PARA USAR! 
echo ===================================
echo.
echo 📝 Próximos pasos:
echo    1. npm run cypress:open  (abrir interfaz de Cypress)
echo    2. Seleccionar tu test específico
echo    3. Ver la ejecución en tiempo real
echo.
echo 🔧 Comandos útiles:
echo    npm run test:unit        - Tests unitarios
echo    npm run test:integration - Tests API real  
echo    npm run cypress:open     - Interfaz de Cypress
echo    npm run help             - Ver todos los comandos
echo.
pause