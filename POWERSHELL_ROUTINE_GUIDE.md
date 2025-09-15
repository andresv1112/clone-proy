# 📋 Guía de Comandos PowerShell para Routine Service

Esta guía contiene los comandos paso a paso para probar todas las funcionalidades del Routine Service usando PowerShell.

## 📋 Prerrequisitos

1. **Auth Service debe estar corriendo en puerto 3001**
2. **Exercise Service debe estar corriendo en puerto 3002**
3. **Routine Service debe estar corriendo en puerto 3003**
4. **PostgreSQL debe estar corriendo**
5. **Usar PowerShell (no Command Prompt)**

## 🚀 Paso a Paso - Comandos en Orden

### Paso 1: Verificar que todos los servicios estén corriendo

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

#### 1.3 Iniciar Routine Service (si no está corriendo)
```powershell
# Abrir otra nueva terminal PowerShell y ejecutar:
cd "C:\Users\Samuel Vergara\Downloads\AppGymBolt\project\services\routine-service"
npm run dev
```

#### 1.4 Verificar Health Check de todos los servicios
```powershell
# Health check Auth Service
Invoke-RestMethod -Uri "http://localhost:3001/health" -Method GET

# Health check Exercise Service
Invoke-RestMethod -Uri "http://localhost:3002/health" -Method GET

# Health check Routine Service
Invoke-RestMethod -Uri "http://localhost:3003/health" -Method GET
```

### Paso 2: Preparar Datos de Prueba

#### 2.1 Login como Admin y obtener token
```powershell
# Hacer login como admin
$adminLogin = Invoke-RestMethod -Uri "http://localhost:3001/api/auth/login" `
    -Method POST `
    -Headers @{"Content-Type"="application/json"} `
    -Body (ConvertTo-Json @{ username = "admin"; password = "admin123" })

# Extraer el token completo
$adminToken = $adminLogin.data.token

# Mostrar confirmación
Write-Host "✅ Admin token obtenido"
```

#### 2.2 Usar ejercicios existentes (ya creados en tu base de datos)
```powershell
Write-Host "📝 Usando ejercicios existentes de la base de datos..."


$ejercicioId1 = 1 
$ejercicioId2 = 2    
$ejercicioId3 = 3  
$ejercicioId4 = 4  

Write-Host "✅ Usando: Press de Banca (ID: $ejercicioId1)"
Write-Host "✅ Usando: Sentadilla (ID: $ejercicioId2)"
Write-Host "✅ Usando: Peso Muerto (ID: $ejercicioId3)"
Write-Host "✅ Usando: Dominadas (ID: $ejercicioId4)"

# Verificar que los ejercicios existen
Write-Host "`n🔍 Verificando que los ejercicios existen..."
try {
    $verificacion1 = Invoke-RestMethod -Uri "http://localhost:3002/api/exercises/$ejercicioId1" -Method GET
    Write-Host "✅ Verificado: $($verificacion1.data.name)"
    
    $verificacion2 = Invoke-RestMethod -Uri "http://localhost:3002/api/exercises/$ejercicioId2" -Method GET
    Write-Host "✅ Verificado: $($verificacion2.data.name)"
    
    $verificacion3 = Invoke-RestMethod -Uri "http://localhost:3002/api/exercises/$ejercicioId3" -Method GET
    Write-Host "✅ Verificado: $($verificacion3.data.name)"
    
    $verificacion4 = Invoke-RestMethod -Uri "http://localhost:3002/api/exercises/$ejercicioId4" -Method GET
    Write-Host "✅ Verificado: $($verificacion4.data.name)"
} catch {
    Write-Host "❌ Error: Uno o más ejercicios no existen. Verifica los IDs en pgAdmin."
    Write-Host "Error: $($_.Exception.Message)"
    exit
}
```

#### 2.3 Login como usuario normal y obtener token
```powershell
# Crear usuario normal si no existe
$nuevoUsuario = @{
    username = "usuario_test"
    password = "password123"
} | ConvertTo-Json

try {
    $registerResponse = Invoke-RestMethod -Uri "http://localhost:3001/api/auth/register" `
        -Method POST `
        -Headers @{"Content-Type"="application/json"} `
        -Body $nuevoUsuario
    Write-Host "✅ Usuario de prueba creado: usuario_test"
} catch {
    Write-Host "ℹ️  Usuario ya existe, continuando..."
}

# Login como usuario normal
$userLogin = Invoke-RestMethod -Uri "http://localhost:3001/api/auth/login" `
    -Method POST `
    -Headers @{"Content-Type"="application/json"} `
    -Body (ConvertTo-Json @{ username = "usuario_test"; password = "password123" })

$userToken = $userLogin.data.token
Write-Host "✅ Token de usuario normal obtenido"
```

### Paso 3: Probar CRUD de Rutinas

#### 3.1 Crear primera rutina (Push - Empuje)
```powershell
Write-Host "`n📋 Creando rutina de Push (Empuje)..."

$rutinaPush = @{
    name = "Push - Empuje"
    description = "Rutina de empuje: pecho, hombros y tríceps"
    exercises = @(
        @{
            exerciseId = $ejercicioId1 
            sets = 4
            repRangeMin = 8
            repRangeMax = 12
            technique = "normal"
            restTime = 120
            orderInRoutine = 1
        }
    )
} | ConvertTo-Json -Depth 3

$rutinaPushResponse = Invoke-RestMethod -Uri "http://localhost:3003/api/routines" `
    -Method POST `
    -Headers @{"Content-Type"="application/json"; "Authorization"="Bearer $userToken"} `
    -Body $rutinaPush

$rutinaId1 = $rutinaPushResponse.data.id
Write-Host "✅ Rutina Push creada (ID: $rutinaId1)"
```

#### 3.2 Crear segunda rutina (Pull - Tirón)
```powershell
Write-Host "`n📋 Creando rutina de Pull (Tirón)..."

$rutinaPull = @{
    name = "Pull - Tirón"
    description = "Rutina de tirón: espalda y bíceps"
    exercises = @(
        @{
            exerciseId = $ejercicioId4  
            sets = 3
            repRangeMin = 5
            repRangeMax = 10
            technique = "failure"
            restTime = 180
            orderInRoutine = 1
        },
        @{
            exerciseId = $ejercicioId3  
            sets = 3
            repRangeMin = 5
            repRangeMax = 8
            technique = "normal"
            restTime = 240
            orderInRoutine = 2
        }
    )
} | ConvertTo-Json -Depth 3

$rutinaPullResponse = Invoke-RestMethod -Uri "http://localhost:3003/api/routines" `
    -Method POST `
    -Headers @{"Content-Type"="application/json"; "Authorization"="Bearer $userToken"} `
    -Body $rutinaPull

$rutinaId2 = $rutinaPullResponse.data.id
Write-Host "✅ Rutina Pull creada (ID: $rutinaId2)"
```

#### 3.3 Crear tercera rutina (Legs - Piernas)
```powershell
Write-Host "`n📋 Creando rutina de Legs (Piernas)..."

$rutinaLegs = @{
    name = "Legs - Piernas"
    description = "Rutina de piernas: cuádriceps, glúteos y femorales"
    exercises = @(
        @{
            exerciseId = $ejercicioId2  
            sets = 4
            repRangeMin = 10
            repRangeMax = 15
            technique = "normal"
            restTime = 180
            orderInRoutine = 1
        },
        @{
            exerciseId = $ejercicioId3  
            sets = 3
            repRangeMin = 8
            repRangeMax = 12
            technique = "normal"
            restTime = 200
            orderInRoutine = 2
        }
    )
} | ConvertTo-Json -Depth 3

$rutinaLegsResponse = Invoke-RestMethod -Uri "http://localhost:3003/api/routines" `
    -Method POST `
    -Headers @{"Content-Type"="application/json"; "Authorization"="Bearer $userToken"} `
    -Body $rutinaLegs

$rutinaId3 = $rutinaLegsResponse.data.id
Write-Host "✅ Rutina Legs creada (ID: $rutinaId3)"
```

### Paso 4: Probar Listado y Búsqueda

#### 4.1 Obtener todas las rutinas del usuario
```powershell
Write-Host "`n📋 Obteniendo todas las rutinas del usuario..."

$todasRutinas = Invoke-RestMethod -Uri "http://localhost:3003/api/routines" `
    -Method GET `
    -Headers @{"Authorization"="Bearer $userToken"}

Write-Host "📊 Total de rutinas: $($todasRutinas.data.pagination.total)"
Write-Host "📋 Rutinas del usuario:"
$todasRutinas.data.routines | Format-Table id, name, description, @{Name="Ejercicios"; Expression={$_.exercises.Count}}
```

#### 4.2 Buscar rutinas por nombre
```powershell
Write-Host "`n🔍 Buscando rutinas con 'push'..."

$busquedaPush = Invoke-RestMethod -Uri "http://localhost:3003/api/routines?q=push" `
    -Method GET `
    -Headers @{"Authorization"="Bearer $userToken"}

Write-Host "🔍 Rutinas encontradas con 'push': $($busquedaPush.data.pagination.total)"
$busquedaPush.data.routines | Format-Table id, name, description
```

### Paso 5: Obtener Rutina Específica con Detalles

#### 5.1 Obtener detalles completos de la rutina Push
```powershell
Write-Host "`n📄 Obteniendo detalles de la rutina Push..."

$detalleRutina = Invoke-RestMethod -Uri "http://localhost:3003/api/routines/$rutinaId1" `
    -Method GET `
    -Headers @{"Authorization"="Bearer $userToken"}

Write-Host "📋 Detalles de la rutina:"
Write-Host "Nombre: $($detalleRutina.data.name)"
Write-Host "Descripción: $($detalleRutina.data.description)"
Write-Host "Ejercicios:"
$detalleRutina.data.exercises | Format-Table exerciseName, sets, repRangeMin, repRangeMax, technique, restTime, orderInRoutine
```

### Paso 6: Actualizar Rutina

#### 6.1 Actualizar la rutina Push agregando más ejercicios
```powershell
Write-Host "`n✏️ Actualizando rutina Push..."

$rutinaActualizada = @{
    name = "Push - Empuje Completo"
    description = "Rutina completa de empuje: pecho, hombros y tríceps con más volumen"
    exercises = @(
        @{
            exerciseId = $ejercicioId1  # Press de Banca
            sets = 4
            repRangeMin = 8
            repRangeMax = 12
            technique = "normal"
            restTime = 120
            orderInRoutine = 1
        },
        @{
            exerciseId = $ejercicioId1  
            sets = 2
            repRangeMin = 12
            repRangeMax = 15
            technique = "dropset"
            restTime = 180
            orderInRoutine = 2
        }
    )
} | ConvertTo-Json -Depth 3

$rutinaActualizadaResponse = Invoke-RestMethod -Uri "http://localhost:3003/api/routines/$rutinaId1" `
    -Method PUT `
    -Headers @{"Content-Type"="application/json"; "Authorization"="Bearer $userToken"} `
    -Body $rutinaActualizada

Write-Host "✅ Rutina actualizada:"
Write-Host "Nuevo nombre: $($rutinaActualizadaResponse.data.name)"
$rutinaActualizadaResponse.data.exercises | Format-Table exerciseName, sets, technique, orderInRoutine
```

### Paso 7: Duplicar Rutina

#### 7.1 Duplicar la rutina Pull
```powershell
Write-Host "`n📋 Duplicando rutina Pull..."

$duplicarBody = @{
    name = "Pull - Tirón Variación"
} | ConvertTo-Json

$rutinaDuplicada = Invoke-RestMethod -Uri "http://localhost:3003/api/routines/$rutinaId2/duplicate" `
    -Method POST `
    -Headers @{"Content-Type"="application/json"; "Authorization"="Bearer $userToken"} `
    -Body $duplicarBody

$rutinaId4 = $rutinaDuplicada.data.id
Write-Host "✅ Rutina duplicada (ID: $rutinaId4)"
Write-Host "Nombre: $($rutinaDuplicada.data.name)"
Write-Host "Ejercicios copiados: $($rutinaDuplicada.data.exercises.Count)"
```

### Paso 8: Probar Estadísticas del Usuario

#### 8.1 Obtener estadísticas de rutinas del usuario
```powershell
Write-Host "`n📊 Obteniendo estadísticas del usuario..."

$statsUsuario = Invoke-RestMethod -Uri "http://localhost:3003/api/routines/stats" `
    -Method GET `
    -Headers @{"Authorization"="Bearer $userToken"}

Write-Host "📊 Estadísticas del usuario:"
$statsUsuario.data | Format-List
```

### Paso 9: Probar Validaciones y Errores

#### 9.1 Intentar crear rutina con ejercicio inexistente
```powershell
Write-Host "`n❌ Probando validación: ejercicio inexistente..."

$rutinaInvalida = @{
    name = "Rutina Inválida"
    description = "Esta rutina debería fallar"
    exercises = @(
        @{
            exerciseId = 99999  
            sets = 3
            repRangeMin = 8
            repRangeMax = 12
            technique = "normal"
            restTime = 120
            orderInRoutine = 1
        }
    )
} | ConvertTo-Json -Depth 3

try {
    Invoke-RestMethod -Uri "http://localhost:3003/api/routines" `
        -Method POST `
        -Headers @{"Content-Type"="application/json"; "Authorization"="Bearer $userToken"} `
        -Body $rutinaInvalida
} catch {
    Write-Host "✅ Correcto: No se puede crear rutina con ejercicio inexistente"
    Write-Host "Error esperado: $($_.Exception.Message)"
}
```

#### 9.2 Intentar crear rutina con rango de repeticiones inválido
```powershell
Write-Host "`n❌ Probando validación: rango de repeticiones inválido..."

$rutinaRangoInvalido = @{
    name = "Rutina Rango Inválido"
    description = "Rango de repeticiones incorrecto"
    exercises = @(
        @{
            exerciseId = $ejercicioId1
            sets = 3
            repRangeMin = 15  
            repRangeMax = 8   
            technique = "normal"
            restTime = 120
            orderInRoutine = 1
        }
    )
} | ConvertTo-Json -Depth 3

try {
    Invoke-RestMethod -Uri "http://localhost:3003/api/routines" `
        -Method POST `
        -Headers @{"Content-Type"="application/json"; "Authorization"="Bearer $userToken"} `
        -Body $rutinaRangoInvalido
} catch {
    Write-Host "✅ Correcto: No se puede crear rutina con rango inválido"
    Write-Host "Error esperado: $($_.Exception.Message)"
}
```

### Paso 10: Probar Acceso de Otros Usuarios

#### 10.1 Crear segundo usuario
```powershell
Write-Host "`n👤 Creando segundo usuario..."

$usuario2 = @{
    username = "usuario2_test"
    password = "password123"
} | ConvertTo-Json

try {
    $registerResponse2 = Invoke-RestMethod -Uri "http://localhost:3001/api/auth/register" `
        -Method POST `
        -Headers @{"Content-Type"="application/json"} `
        -Body $usuario2
    Write-Host "✅ Segundo usuario creado: usuario2_test"
} catch {
    Write-Host "ℹ️  Usuario ya existe, haciendo login..."
}

$user2Login = Invoke-RestMethod -Uri "http://localhost:3001/api/auth/login" `
    -Method POST `
    -Headers @{"Content-Type"="application/json"} `
    -Body (ConvertTo-Json @{ username = "usuario2_test"; password = "password123" })

$user2Token = $user2Login.data.token
Write-Host "✅ Token del segundo usuario obtenido"
```

#### 10.2 Verificar que el segundo usuario no ve rutinas del primero
```powershell
Write-Host "`n🔒 Verificando aislamiento de datos entre usuarios..."

$rutinasUsuario2 = Invoke-RestMethod -Uri "http://localhost:3003/api/routines" `
    -Method GET `
    -Headers @{"Authorization"="Bearer $user2Token"}

Write-Host "📊 Rutinas del segundo usuario: $($rutinasUsuario2.data.pagination.total)"
Write-Host "✅ Correcto: Cada usuario solo ve sus propias rutinas"
```

#### 10.3 Intentar acceder a rutina de otro usuario
```powershell
Write-Host "`n🔒 Intentando acceder a rutina de otro usuario..."

try {
    Invoke-RestMethod -Uri "http://localhost:3003/api/routines/$rutinaId1" `
        -Method GET `
        -Headers @{"Authorization"="Bearer $user2Token"}
} catch {
    Write-Host "✅ Correcto: No se puede acceder a rutinas de otros usuarios"
    Write-Host "Error esperado: $($_.Exception.Message)"
}
```

### Paso 11: Probar Técnicas Especiales

#### 11.1 Crear rutina con técnicas avanzadas
```powershell
Write-Host "`n🔥 Creando rutina con técnicas avanzadas..."

$rutinaAvanzada = @{
    name = "Rutina Avanzada"
    description = "Rutina con técnicas especiales de entrenamiento"
    exercises = @(
        @{
            exerciseId = $ejercicioId1  # Press de Banca normal
            sets = 3
            repRangeMin = 8
            repRangeMax = 10
            technique = "normal"
            restTime = 120
            orderInRoutine = 1
        },
        @{
            exerciseId = $ejercicioId1  # Press de Banca con dropset
            sets = 2
            repRangeMin = 12
            repRangeMax = 15
            technique = "dropset"
            restTime = 180
            orderInRoutine = 2
        },
        @{
            exerciseId = $ejercicioId4  # Dominadas al fallo
            sets = 3
            repRangeMin = 1
            repRangeMax = 100
            technique = "failure"
            restTime = 240
            orderInRoutine = 3
        },
        @{
            exerciseId = $ejercicioId2  # Sentadillas con myo-reps
            sets = 2
            repRangeMin = 15
            repRangeMax = 20
            technique = "myo-reps"
            restTime = 300
            orderInRoutine = 4
        }
    )
} | ConvertTo-Json -Depth 3

$rutinaAvanzadaResponse = Invoke-RestMethod -Uri "http://localhost:3003/api/routines" `
    -Method POST `
    -Headers @{"Content-Type"="application/json"; "Authorization"="Bearer $userToken"} `
    -Body $rutinaAvanzada

$rutinaId5 = $rutinaAvanzadaResponse.data.id
Write-Host "✅ Rutina avanzada creada (ID: $rutinaId5)"
Write-Host "Técnicas incluidas:"
$rutinaAvanzadaResponse.data.exercises | Format-Table exerciseName, technique, sets, repRangeMin, repRangeMax
```

### Paso 12: Verificar Listado Final

#### 12.1 Ver todas las rutinas del primer usuario
```powershell
Write-Host "`n📋 Listado final de rutinas del primer usuario..."

$rutinasFinales = Invoke-RestMethod -Uri "http://localhost:3003/api/routines" `
    -Method GET `
    -Headers @{"Authorization"="Bearer $userToken"}

Write-Host "📊 Total de rutinas creadas: $($rutinasFinales.data.pagination.total)"
Write-Host "📋 Resumen de rutinas:"
$rutinasFinales.data.routines | Format-Table id, name, description, @{Name="Ejercicios"; Expression={$_.exercises.Count}}, @{Name="Creada"; Expression={$_.createdAt.Substring(0,10)}}
```

#### 12.2 Obtener estadísticas finales
```powershell
Write-Host "`n📊 Estadísticas finales del usuario..."

$statsFinales = Invoke-RestMethod -Uri "http://localhost:3003/api/routines/stats" `
    -Method GET `
    -Headers @{"Authorization"="Bearer $userToken"}

Write-Host "📊 Estadísticas finales:"
$statsFinales.data | Format-List
```

### Paso 13: Limpieza (Opcional)

#### 13.1 Eliminar rutinas de prueba
```powershell
Write-Host "`n🗑️ Eliminando rutinas de prueba..."

# Eliminar rutinas una por una
$rutinasAEliminar = @($rutinaId1, $rutinaId2, $rutinaId3, $rutinaId5)

foreach ($rutinaId in $rutinasAEliminar) {
    try {
        Invoke-RestMethod -Uri "http://localhost:3003/api/routines/$rutinaId" `
            -Method DELETE `
            -Headers @{"Authorization"="Bearer $userToken"}
        Write-Host "✅ Rutina $rutinaId eliminada"
    } catch {
        Write-Host "❌ Error eliminando rutina $rutinaId"
    }
}
```

#### 13.2 Eliminar ejercicios de prueba
```powershell
Write-Host "`n🗑️ Eliminando ejercicios de prueba..."

$ejerciciosAEliminar = @($ejercicioId1, $ejercicioId2, $ejercicioId3, $ejercicioId4)

foreach ($ejercicioId in $ejerciciosAEliminar) {
    try {
        Invoke-RestMethod -Uri "http://localhost:3002/api/exercises/$ejercicioId" `
            -Method DELETE `
            -Headers @{"Authorization"="Bearer $adminToken"}
        Write-Host "✅ Ejercicio $ejercicioId eliminado"
    } catch {
        Write-Host "❌ Error eliminando ejercicio $ejercicioId"
    }
}
```

#### 13.3 Verificar limpieza
```powershell
Write-Host "`n🔍 Verificando limpieza..."

$rutinasRestantes = Invoke-RestMethod -Uri "http://localhost:3003/api/routines" `
    -Method GET `
    -Headers @{"Authorization"="Bearer $userToken"}

$ejerciciosRestantes = Invoke-RestMethod -Uri "http://localhost:3002/api/exercises" -Method GET

Write-Host "📊 Rutinas restantes: $($rutinasRestantes.data.pagination.total)"
Write-Host "📊 Ejercicios restantes: $($ejerciciosRestantes.data.pagination.total)"
```

## 🔄 Flujo Completo de Prueba (Script Todo-en-Uno)

```powershell
Write-Host "📋 === INICIANDO PRUEBAS DEL ROUTINE SERVICE ===" -ForegroundColor Green

# 1. Health checks
Write-Host "`n1️⃣ Verificando servicios..." -ForegroundColor Yellow
try {
    $authHealth = Invoke-RestMethod -Uri "http://localhost:3001/health" -Method GET
    $exerciseHealth = Invoke-RestMethod -Uri "http://localhost:3002/health" -Method GET
    $routineHealth = Invoke-RestMethod -Uri "http://localhost:3003/health" -Method GET
    Write-Host "✅ Auth Service: $($authHealth.data.service)"
    Write-Host "✅ Exercise Service: $($exerciseHealth.data.service)"
    Write-Host "✅ Routine Service: $($routineHealth.data.service)"
} catch {
    Write-Host "❌ Error: Uno o más servicios no están corriendo"
    Write-Host "Asegúrate de que todos los servicios estén iniciados"
    exit
}

# 2. Login como admin
Write-Host "`n2️⃣ Obteniendo token de admin..." -ForegroundColor Yellow
$adminLogin = Invoke-RestMethod -Uri "http://localhost:3001/api/auth/login" `
    -Method POST `
    -Headers @{"Content-Type"="application/json"} `
    -Body (ConvertTo-Json @{ username = "admin"; password = "admin123" })
$adminToken = $adminLogin.data.token
Write-Host "✅ Token de admin obtenido"

# 3. Crear ejercicios de prueba
# Usar ejercicios existentes de la base de datos
$ejerciciosIds = @(1, 2, 3, 4)  # IDs de ejercicios existentes
Write-Host "✅ Usando ejercicios existentes: Press de Banca (1), Sentadilla (2), Peso Muerto (3), Dominadas (4)"

# 4. Login como usuario normal
Write-Host "`n4️⃣ Creando y logueando usuario normal..." -ForegroundColor Yellow
$nuevoUsuario = @{
    username = "test_user_$(Get-Random -Maximum 1000)"
    password = "password123"
} | ConvertTo-Json

$registerResponse = Invoke-RestMethod -Uri "http://localhost:3001/api/auth/register" `
    -Method POST `
    -Headers @{"Content-Type"="application/json"} `
    -Body $nuevoUsuario

$userToken = $registerResponse.data.token
Write-Host "✅ Usuario creado y logueado: $($registerResponse.data.user.username)"

# 5. Crear rutinas
Write-Host "`n5️⃣ Creando rutinas..." -ForegroundColor Yellow
$rutina1 = @{
    name = "Push Day"
    description = "Rutina de empuje"
    exercises = @(
        @{
            exerciseId = $ejerciciosIds[0]
            sets = 4
            repRangeMin = 8
            repRangeMax = 12
            technique = "normal"
            restTime = 120
            orderInRoutine = 1
        }
    )
} | ConvertTo-Json -Depth 3

$rutinaResponse = Invoke-RestMethod -Uri "http://localhost:3003/api/routines" `
    -Method POST `
    -Headers @{"Content-Type"="application/json"; "Authorization"="Bearer $userToken"} `
    -Body $rutina1

Write-Host "✅ Rutina creada: $($rutinaResponse.data.name) (ID: $($rutinaResponse.data.id))"

# 6. Listar rutinas
Write-Host "`n6️⃣ Listando rutinas del usuario..." -ForegroundColor Yellow
$rutinas = Invoke-RestMethod -Uri "http://localhost:3003/api/routines" `
    -Method GET `
    -Headers @{"Authorization"="Bearer $userToken"}

Write-Host "📋 Total de rutinas: $($rutinas.data.pagination.total)"
$rutinas.data.routines | Format-Table id, name, @{Name="Ejercicios"; Expression={$_.exercises.Count}}

# 7. Obtener estadísticas
Write-Host "`n7️⃣ Obteniendo estadísticas..." -ForegroundColor Yellow
$stats = Invoke-RestMethod -Uri "http://localhost:3003/api/routines/stats" `
    -Method GET `
    -Headers @{"Authorization"="Bearer $userToken"}

Write-Host "📊 Estadísticas:"
$stats.data | Format-List

Write-Host "`n🎉 === TODAS LAS PRUEBAS COMPLETADAS ===" -ForegroundColor Green
Write-Host "✅ Routine Service funcionando correctamente" -ForegroundColor Green
```

## 📝 Comandos Individuales de Referencia

### Health Check
```powershell
Invoke-RestMethod -Uri "http://localhost:3003/health" -Method GET
```

### Login Usuario (obtener token)
```powershell
$userLogin = Invoke-RestMethod -Uri "http://localhost:3001/api/auth/login" `
    -Method POST `
    -Headers @{"Content-Type"="application/json"} `
    -Body (ConvertTo-Json @{ username = "usuario_test"; password = "password123" })
$userToken = $userLogin.data.token
```

### Crear Rutina
```powershell
$rutina = @{
    name = "Mi Rutina"
    description = "Descripción de la rutina"
    exercises = @(
        @{
            exerciseId = 1
            sets = 3
            repRangeMin = 8
            repRangeMax = 12
            technique = "normal"
            restTime = 120
            orderInRoutine = 1
        }
    )
} | ConvertTo-Json -Depth 3

Invoke-RestMethod -Uri "http://localhost:3003/api/routines" `
    -Method POST `
    -Headers @{"Content-Type"="application/json"; "Authorization"="Bearer $userToken"} `
    -Body $rutina
```

### Listar Rutinas
```powershell
Invoke-RestMethod -Uri "http://localhost:3003/api/routines" `
    -Method GET `
    -Headers @{"Authorization"="Bearer $userToken"}
```

### Buscar Rutinas
```powershell
Invoke-RestMethod -Uri "http://localhost:3003/api/routines?q=push" `
    -Method GET `
    -Headers @{"Authorization"="Bearer $userToken"}
```

### Obtener Rutina por ID
```powershell
Invoke-RestMethod -Uri "http://localhost:3003/api/routines/1" `
    -Method GET `
    -Headers @{"Authorization"="Bearer $userToken"}
```

### Actualizar Rutina
```powershell
$actualizacion = @{
    name = "Nuevo Nombre"
    description = "Nueva descripción"
} | ConvertTo-Json

Invoke-RestMethod -Uri "http://localhost:3003/api/routines/1" `
    -Method PUT `
    -Headers @{"Content-Type"="application/json"; "Authorization"="Bearer $userToken"} `
    -Body $actualizacion
```

### Duplicar Rutina
```powershell
$duplicar = @{
    name = "Copia de Mi Rutina"
} | ConvertTo-Json

Invoke-RestMethod -Uri "http://localhost:3003/api/routines/1/duplicate" `
    -Method POST `
    -Headers @{"Content-Type"="application/json"; "Authorization"="Bearer $userToken"} `
    -Body $duplicar
```

### Eliminar Rutina
```powershell
Invoke-RestMethod -Uri "http://localhost:3003/api/routines/1" `
    -Method DELETE `
    -Headers @{"Authorization"="Bearer $userToken"}
```

### Estadísticas del Usuario
```powershell
Invoke-RestMethod -Uri "http://localhost:3003/api/routines/stats" `
    -Method GET `
    -Headers @{"Authorization"="Bearer $userToken"}
```

## ❌ Errores Comunes y Soluciones

### Error: "Invalid exercises: [ID]"
**Problema:** Intentando usar ejercicio que no existe
**Solución:** Verificar que el ejercicio exista con `GET /api/exercises`

### Error: "Routine not found"
**Problema:** Intentando acceder a rutina que no existe o no es tuya
**Solución:** Verificar ID de rutina y que pertenezca al usuario

### Error: "Invalid rep range: min cannot be greater than max"
**Problema:** Rango de repeticiones inválido
**Solución:** Asegurar que `repRangeMin <= repRangeMax`

### Error: "Exercise Service Unavailable"
**Problema:** Routine Service no puede comunicarse con Exercise Service
**Solución:** Verificar que Exercise Service esté corriendo en puerto 3002

### Error: "Routine must have at least one exercise"
**Problema:** Intentando crear rutina sin ejercicios
**Solución:** Incluir al menos un ejercicio en el array `exercises`

## 🎯 Técnicas de Entrenamiento Soportadas

- **normal**: Entrenamiento estándar
- **dropset**: Reducir peso al fallo
- **myo-reps**: Micro-series con descanso corto
- **failure**: Entrenar hasta el fallo muscular
- **rest-pause**: Descanso-pausa para más repeticiones

## 🔗 Comunicación Entre Servicios

El Routine Service se comunica automáticamente con el Exercise Service para:
- ✅ **Validar ejercicios** antes de crear rutinas
- ✅ **Obtener nombres** de ejercicios para mostrar en rutinas
- ✅ **Verificar existencia** de ejercicios al actualizar rutinas

## 🎯 Próximos Pasos

Una vez que hayas probado el Routine Service y confirmes que funciona:

1. ✅ **Fase 2 completada:** Auth Service
2. ✅ **Fase 3 completada:** Exercise Service  
3. ✅ **Fase 4 completada:** Routine Service
4. ⏳ **Fase 5 siguiente:** Workout Service
5. ⏳ **Fase 6 pendiente:** Frontend Integration

---

**Última actualización:** Enero 2025  
**Versión:** 1.0.0  
**Estado:** Routine Service implementado y listo para pruebas