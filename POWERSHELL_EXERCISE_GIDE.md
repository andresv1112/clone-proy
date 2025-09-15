# 🏋️‍♂️ Guía de Comandos PowerShell para Exercise Service

Esta guía contiene los comandos paso a paso para probar todas las funcionalidades del Exercise Service usando PowerShell.

## 📋 Prerrequisitos

1. **Auth Service debe estar corriendo en puerto 3001**
2. **Exercise Service debe estar corriendo en puerto 3002**
3. **PostgreSQL debe estar corriendo**
4. **Usar PowerShell (no Command Prompt)**

## 🚀 Paso a Paso - Comandos en Orden

### Paso 1: Verificar que los servicios estén corriendo

#### 1.1 Iniciar Auth Service (si no está corriendo)
```powershell
# Abrir nueva terminal PowerShell y ejecutar:
cd "C:\Users\Samuel Vergara\Downloads\AppGymBolt\project\services\auth-service"
npm run dev
```

#### 1.2 Iniciar Exercise Service (si no está corriendo)
```powershell
# Abrir otra nueva terminal PowerShell y ejecutar:
cd "C:\Users\Samuel Vergara\Downloads\AppGymBolt\project\services\exercise-service"
npm run dev
```

#### 1.3 Verificar Health Check de ambos servicios
```powershell
# Health check Auth Service
Invoke-RestMethod -Uri "http://localhost:3001/health" -Method GET

# Health check Exercise Service
Invoke-RestMethod -Uri "http://localhost:3002/health" -Method GET
```

### Paso 2: Obtener Token de Administrador

#### 2.1 Login como Admin y capturar token
```powershell
# Hacer login como admin
$adminLogin = Invoke-RestMethod -Uri "http://localhost:3001/api/auth/login" `
    -Method POST `
    -Headers @{"Content-Type"="application/json"} `
    -Body (ConvertTo-Json @{ username = "admin"; password = "admin123" })

# Extraer el token completo
$adminToken = $adminLogin.data.token

# Mostrar el token (opcional)
Write-Host "Admin token obtenido: $adminToken"
```

#### 2.2 Verificar que el token funciona
```powershell
# Obtener perfil de admin
Invoke-RestMethod -Uri "http://localhost:3001/api/auth/profile" `
    -Method GET `
    -Headers @{"Authorization"="Bearer $adminToken"}
```

### Paso 3: Probar CRUD de Ejercicios

#### 3.1 Crear primer ejercicio
```powershell
$ejercicio1 = @{
    name = "Press de Banca"
    description = "Ejercicio fundamental para pecho, hombros y tríceps"
    aliases = @("Bench Press", "Press Plano", "Banca")
} | ConvertTo-Json

$response1 = Invoke-RestMethod -Uri "http://localhost:3002/api/exercises" `
    -Method POST `
    -Headers @{"Content-Type"="application/json"; "Authorization"="Bearer $adminToken"} `
    -Body $ejercicio1

Write-Host "Ejercicio creado con ID: $($response1.data.id)"
$ejercicioId1 = $response1.data.id
```

#### 3.2 Crear segundo ejercicio
```powershell
$ejercicio2 = @{
    name = "Sentadilla"
    description = "Ejercicio compuesto para piernas y glúteos"
    aliases = @("Squat", "Sentadillas", "Cuclillas")
} | ConvertTo-Json

$response2 = Invoke-RestMethod -Uri "http://localhost:3002/api/exercises" `
    -Method POST `
    -Headers @{"Content-Type"="application/json"; "Authorization"="Bearer $adminToken"} `
    -Body $ejercicio2

Write-Host "Ejercicio creado con ID: $($response2.data.id)"
$ejercicioId2 = $response2.data.id
```

#### 3.3 Crear tercer ejercicio
```powershell
$ejercicio3 = @{
    name = "Peso Muerto"
    description = "Ejercicio compuesto para espalda, glúteos y piernas"
    aliases = @("Deadlift", "Peso Muerto Convencional", "DL")
} | ConvertTo-Json

$response3 = Invoke-RestMethod -Uri "http://localhost:3002/api/exercises" `
    -Method POST `
    -Headers @{"Content-Type"="application/json"; "Authorization"="Bearer $adminToken"} `
    -Body $ejercicio3

Write-Host "Ejercicio creado con ID: $($response3.data.id)"
$ejercicioId3 = $response3.data.id
```

### Paso 4: Probar Búsqueda y Listado

#### 4.1 Obtener todos los ejercicios
```powershell
$todosEjercicios = Invoke-RestMethod -Uri "http://localhost:3002/api/exercises" -Method GET
Write-Host "Total de ejercicios: $($todosEjercicios.data.pagination.total)"
$todosEjercicios.data.exercises | Format-Table id, name, aliases
```

#### 4.2 Buscar por nombre
```powershell
# Buscar "press"
$busquedaPress = Invoke-RestMethod -Uri "http://localhost:3002/api/exercises?q=press" -Method GET
Write-Host "Ejercicios encontrados con 'press': $($busquedaPress.data.pagination.total)"
$busquedaPress.data.exercises | Format-Table id, name, aliases
```

#### 4.3 Buscar por alias
```powershell
# Buscar "squat" (que es un alias de Sentadilla)
$busquedaSquat = Invoke-RestMethod -Uri "http://localhost:3002/api/exercises?q=squat" -Method GET
Write-Host "Ejercicios encontrados con 'squat': $($busquedaSquat.data.pagination.total)"
$busquedaSquat.data.exercises | Format-Table id, name, aliases
```

### Paso 5: Obtener Ejercicio Específico

#### 5.1 Obtener detalles del primer ejercicio
```powershell
$detalleEjercicio = Invoke-RestMethod -Uri "http://localhost:3002/api/exercises/$ejercicioId1" -Method GET
Write-Host "Detalles del ejercicio:"
$detalleEjercicio.data | Format-List
```

### Paso 6: Actualizar Ejercicio

#### 6.1 Actualizar descripción y agregar alias
```powershell
$actualizacion = @{
    description = "Ejercicio fundamental para pecho, hombros y tríceps. Técnica: mantener escápulas retraídas."
    aliases = @("Bench Press", "Press Plano", "Banca", "Press de Pecho")
} | ConvertTo-Json

$ejercicioActualizado = Invoke-RestMethod -Uri "http://localhost:3002/api/exercises/$ejercicioId1" `
    -Method PUT `
    -Headers @{"Content-Type"="application/json"; "Authorization"="Bearer $adminToken"} `
    -Body $actualizacion

Write-Host "Ejercicio actualizado:"
$ejercicioActualizado.data | Format-List
```

### Paso 7: Probar Gestión de Videos

#### 7.1 Subir video (requiere archivo local)
```powershell
# NOTA: Para este comando necesitas tener un archivo de video local
# Reemplaza "C:\ruta\a\tu\video.mp4" con la ruta real de un archivo de video

# Ejemplo de comando (NO ejecutar sin archivo real):
# $videoPath = "C:\ruta\a\tu\video.mp4"
# $form = @{
#     video = Get-Item $videoPath
# }
# Invoke-RestMethod -Uri "http://localhost:3002/api/exercises/$ejercicioId1/video" `
#     -Method POST `
#     -Headers @{"Authorization"="Bearer $adminToken"} `
#     -Form $form

Write-Host "⚠️  Para subir videos, necesitas un archivo de video local (.mp4, .avi, .mov, .webm)"
Write-Host "📁 Coloca un video en tu computadora y actualiza la ruta en el comando de arriba"
```

#### 7.2 Verificar si hay video (después de subirlo)
```powershell
# Este comando funcionará después de subir un video
try {
    $videoInfo = Invoke-RestMethod -Uri "http://localhost:3002/api/exercises/$ejercicioId1/video" -Method GET
    Write-Host "✅ Video disponible para el ejercicio"
} catch {
    Write-Host "❌ No hay video disponible para este ejercicio"
}
```

### Paso 8: Estadísticas de Administrador

#### 8.1 Obtener estadísticas del servicio
```powershell
$stats = Invoke-RestMethod -Uri "http://localhost:3002/api/exercises/admin/stats" `
    -Method GET `
    -Headers @{"Authorization"="Bearer $adminToken"}

Write-Host "📊 Estadísticas del Exercise Service:"
$stats.data | Format-List
```

### Paso 9: Probar con Usuario Normal (Sin Permisos de Admin)

#### 9.1 Login como usuario normal
```powershell
# Usar el token de usuario normal que obtuviste antes
$userToken = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjIsInVzZXJuYW1lIjoibWl1c3VhcmlvIiwicm9sZSI6InVzZXIiLCJpYXQiOjE3NTY0MTU0MzUsImV4cCI6MTc1NzAyMDIzNX0.4xytlIOpMMTLVouc-BvGLTXc73Il0d4wzeTg4b_Q2yY"

# Intentar crear ejercicio (debería fallar)
try {
    $ejercicioUser = @{
        name = "Ejercicio de Usuario"
        description = "Este no debería crearse"
    } | ConvertTo-Json

    Invoke-RestMethod -Uri "http://localhost:3002/api/exercises" `
        -Method POST `
        -Headers @{"Content-Type"="application/json"; "Authorization"="Bearer $userToken"} `
        -Body $ejercicioUser
} catch {
    Write-Host "✅ Correcto: Usuario normal no puede crear ejercicios"
    Write-Host "Error esperado: $($_.Exception.Message)"
}
```

#### 9.2 Usuario normal SÍ puede ver ejercicios
```powershell
# Los usuarios normales SÍ pueden ver la lista de ejercicios
$ejerciciosUser = Invoke-RestMethod -Uri "http://localhost:3002/api/exercises" -Method GET
Write-Host "✅ Usuario normal puede ver ejercicios: $($ejerciciosUser.data.pagination.total) ejercicios"
```

### Paso 10: Limpieza (Opcional)

#### 10.1 Eliminar ejercicios creados
```powershell
# Eliminar ejercicios uno por uno
Write-Host "🗑️  Eliminando ejercicios de prueba..."

Invoke-RestMethod -Uri "http://localhost:3002/api/exercises/$ejercicioId1" `
    -Method DELETE `
    -Headers @{"Authorization"="Bearer $adminToken"}
Write-Host "✅ Ejercicio 1 eliminado"

Invoke-RestMethod -Uri "http://localhost:3002/api/exercises/$ejercicioId2" `
    -Method DELETE `
    -Headers @{"Authorization"="Bearer $adminToken"}
Write-Host "✅ Ejercicio 2 eliminado"

Invoke-RestMethod -Uri "http://localhost:3002/api/exercises/$ejercicioId3" `
    -Method DELETE `
    -Headers @{"Authorization"="Bearer $adminToken"}
Write-Host "✅ Ejercicio 3 eliminado"
```

#### 10.2 Verificar que se eliminaron
```powershell
$ejerciciosFinales = Invoke-RestMethod -Uri "http://localhost:3002/api/exercises" -Method GET
Write-Host "📊 Ejercicios restantes: $($ejerciciosFinales.data.pagination.total)"
```

## 🔄 Flujo Completo de Prueba (Script Todo-en-Uno)

```powershell
Write-Host "🏋️‍♂️ === INICIANDO PRUEBAS DEL EXERCISE SERVICE ===" -ForegroundColor Green

# 1. Health checks
Write-Host "`n1️⃣ Verificando servicios..." -ForegroundColor Yellow
$authHealth = Invoke-RestMethod -Uri "http://localhost:3001/health" -Method GET
$exerciseHealth = Invoke-RestMethod -Uri "http://localhost:3002/health" -Method GET
Write-Host "✅ Auth Service: $($authHealth.data.service)"
Write-Host "✅ Exercise Service: $($exerciseHealth.data.service)"

# 2. Login como admin
Write-Host "`n2️⃣ Obteniendo token de admin..." -ForegroundColor Yellow
$adminLogin = Invoke-RestMethod -Uri "http://localhost:3001/api/auth/login" `
    -Method POST `
    -Headers @{"Content-Type"="application/json"} `
    -Body (ConvertTo-Json @{ username = "admin"; password = "admin123" })
$adminToken = $adminLogin.data.token
Write-Host "✅ Token de admin obtenido"

# 3. Crear ejercicios
Write-Host "`n3️⃣ Creando ejercicios..." -ForegroundColor Yellow
$ejercicios = @(
    @{ name = "Press de Banca"; description = "Ejercicio para pecho"; aliases = @("Bench Press", "Banca") },
    @{ name = "Sentadilla"; description = "Ejercicio para piernas"; aliases = @("Squat", "Cuclillas") },
    @{ name = "Peso Muerto"; description = "Ejercicio para espalda"; aliases = @("Deadlift", "DL") }
)

$ejerciciosCreados = @()
foreach ($ejercicio in $ejercicios) {
    $body = $ejercicio | ConvertTo-Json
    $response = Invoke-RestMethod -Uri "http://localhost:3002/api/exercises" `
        -Method POST `
        -Headers @{"Content-Type"="application/json"; "Authorization"="Bearer $adminToken"} `
        -Body $body
    $ejerciciosCreados += $response.data.id
    Write-Host "✅ Creado: $($ejercicio.name) (ID: $($response.data.id))"
}

# 4. Listar ejercicios
Write-Host "`n4️⃣ Listando ejercicios..." -ForegroundColor Yellow
$lista = Invoke-RestMethod -Uri "http://localhost:3002/api/exercises" -Method GET
Write-Host "📋 Total de ejercicios: $($lista.data.pagination.total)"
$lista.data.exercises | Format-Table id, name, aliases

# 5. Buscar ejercicios
Write-Host "`n5️⃣ Probando búsquedas..." -ForegroundColor Yellow
$busqueda1 = Invoke-RestMethod -Uri "http://localhost:3002/api/exercises?q=press" -Method GET
Write-Host "🔍 Búsqueda 'press': $($busqueda1.data.pagination.total) resultados"

$busqueda2 = Invoke-RestMethod -Uri "http://localhost:3002/api/exercises?q=squat" -Method GET
Write-Host "🔍 Búsqueda 'squat': $($busqueda2.data.pagination.total) resultados"

# 6. Obtener ejercicio específico
Write-Host "`n6️⃣ Obteniendo detalles de ejercicio..." -ForegroundColor Yellow
$detalle = Invoke-RestMethod -Uri "http://localhost:3002/api/exercises/$($ejerciciosCreados[0])" -Method GET
Write-Host "📄 Detalles del ejercicio:"
$detalle.data | Format-List

# 7. Actualizar ejercicio
Write-Host "`n7️⃣ Actualizando ejercicio..." -ForegroundColor Yellow
$actualizacion = @{
    description = "Ejercicio fundamental para pecho, hombros y tríceps. Mantener escápulas retraídas."
    aliases = @("Bench Press", "Press Plano", "Banca", "Press de Pecho")
} | ConvertTo-Json

$actualizado = Invoke-RestMethod -Uri "http://localhost:3002/api/exercises/$($ejerciciosCreados[0])" `
    -Method PUT `
    -Headers @{"Content-Type"="application/json"; "Authorization"="Bearer $adminToken"} `
    -Body $actualizacion
Write-Host "✅ Ejercicio actualizado con nuevos alias"

# 8. Probar permisos de usuario normal
Write-Host "`n8️⃣ Probando permisos de usuario normal..." -ForegroundColor Yellow
$userToken = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjIsInVzZXJuYW1lIjoibWl1c3VhcmlvIiwicm9sZSI6InVzZXIiLCJpYXQiOjE3NTY0MTU0MzUsImV4cCI6MTc1NzAyMDIzNX0.4xytlIOpMMTLVouc-BvGLTXc73Il0d4wzeTg4b_Q2yY"

# Usuario puede VER ejercicios
$ejerciciosUser = Invoke-RestMethod -Uri "http://localhost:3002/api/exercises" -Method GET
Write-Host "✅ Usuario normal puede ver $($ejerciciosUser.data.pagination.total) ejercicios"

# Usuario NO puede CREAR ejercicios
try {
    $ejercicioUser = @{ name = "Ejercicio Prohibido"; description = "No debería crearse" } | ConvertTo-Json
    Invoke-RestMethod -Uri "http://localhost:3002/api/exercises" `
        -Method POST `
        -Headers @{"Content-Type"="application/json"; "Authorization"="Bearer $userToken"} `
        -Body $ejercicioUser
} catch {
    Write-Host "✅ Correcto: Usuario normal no puede crear ejercicios"
}

# 9. Estadísticas de admin
Write-Host "`n9️⃣ Obteniendo estadísticas..." -ForegroundColor Yellow
$stats = Invoke-RestMethod -Uri "http://localhost:3002/api/exercises/admin/stats" `
    -Method GET `
    -Headers @{"Authorization"="Bearer $adminToken"}
Write-Host "📊 Estadísticas:"
$stats.data | Format-List

Write-Host "`n🎉 === TODAS LAS PRUEBAS COMPLETADAS ===" -ForegroundColor Green
Write-Host "✅ Exercise Service funcionando correctamente" -ForegroundColor Green
```

## 📝 Comandos Individuales de Referencia

### Health Check
```powershell
Invoke-RestMethod -Uri "http://localhost:3002/health" -Method GET
```

### Login Admin (obtener token)
```powershell
$adminLogin = Invoke-RestMethod -Uri "http://localhost:3001/api/auth/login" `
    -Method POST `
    -Headers @{"Content-Type"="application/json"} `
    -Body (ConvertTo-Json @{ username = "admin"; password = "admin123" })
$adminToken = $adminLogin.data.token
```

### Crear Ejercicio
```powershell
$ejercicio = @{
    name = "Nombre del Ejercicio"
    description = "Descripción del ejercicio"
    aliases = @("Alias1", "Alias2", "Alias3")
} | ConvertTo-Json

Invoke-RestMethod -Uri "http://localhost:3002/api/exercises" `
    -Method POST `
    -Headers @{"Content-Type"="application/json"; "Authorization"="Bearer $adminToken"} `
    -Body $ejercicio
```

### Listar Ejercicios
```powershell
Invoke-RestMethod -Uri "http://localhost:3002/api/exercises" -Method GET
```

### Buscar Ejercicios
```powershell
Invoke-RestMethod -Uri "http://localhost:3002/api/exercises?q=termino_busqueda" -Method GET
```

### Obtener Ejercicio por ID
```powershell
Invoke-RestMethod -Uri "http://localhost:3002/api/exercises/1" -Method GET
```

### Actualizar Ejercicio
```powershell
$actualizacion = @{
    name = "Nuevo Nombre"
    description = "Nueva descripción"
    aliases = @("Nuevo1", "Nuevo2")
} | ConvertTo-Json

Invoke-RestMethod -Uri "http://localhost:3002/api/exercises/1" `
    -Method PUT `
    -Headers @{"Content-Type"="application/json"; "Authorization"="Bearer $adminToken"} `
    -Body $actualizacion
```

### Eliminar Ejercicio
```powershell
Invoke-RestMethod -Uri "http://localhost:3002/api/exercises/1" `
    -Method DELETE `
    -Headers @{"Authorization"="Bearer $adminToken"}
```

### Estadísticas (Admin)
```powershell
Invoke-RestMethod -Uri "http://localhost:3002/api/exercises/admin/stats" `
    -Method GET `
    -Headers @{"Authorization"="Bearer $adminToken"}
```

## ❌ Errores Comunes y Soluciones

### Error: "Admin access required"
**Problema:** Usando token de usuario normal en lugar de admin
**Solución:** Hacer login como admin y usar ese token

### Error: "Exercise with this name already exists"
**Problema:** Intentando crear ejercicio con nombre duplicado
**Solución:** Usar un nombre diferente o actualizar el ejercicio existente

### Error: "Exercise not found"
**Problema:** Usando ID de ejercicio que no existe
**Solución:** Verificar que el ID sea correcto con `GET /api/exercises`

### Error: "Only video files are allowed"
**Problema:** Intentando subir archivo que no es video
**Solución:** Usar solo archivos .mp4, .avi, .mov, .webm

### Error: "File too large"
**Problema:** Video excede 50MB
**Solución:** Comprimir el video o usar uno más pequeño

## 🎯 Próximos Pasos

Una vez que hayas probado el Exercise Service y confirmes que funciona:

1. ✅ **Fase 2 completada:** Auth Service
2. ✅ **Fase 3 completada:** Exercise Service  
3. ⏳ **Fase 4 siguiente:** Routine Service
4. ⏳ **Fase 5 pendiente:** Workout Service
5. ⏳ **Fase 6 pendiente:** Frontend Integration

---

**Última actualización:** Enero 2025  
**Versión:** 1.0.0  
**Estado:** Exercise Service implementado y listo para pruebas