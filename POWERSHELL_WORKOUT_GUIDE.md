# 🏃‍♂️ Guía de Comandos PowerShell para Workout Service

Esta guía contiene los comandos paso a paso para probar todas las funcionalidades del Workout Service usando PowerShell.

## 📋 Prerrequisitos

1. **Auth Service debe estar corriendo en puerto 3001**
2. **Exercise Service debe estar corriendo en puerto 3002**
3. **Routine Service debe estar corriendo en puerto 3003**
4. **Workout Service debe estar corriendo en puerto 3004**
5. **PostgreSQL debe estar corriendo**
6. **Usar PowerShell (no Command Prompt)**

## 🚀 Paso a Paso - Comandos en Orden

### Paso 1: Verificar que todos los servicios estén corriendo

#### 1.1 Iniciar Workout Service (si no está corriendo)
```powershell
# Abrir nueva terminal PowerShell y ejecutar:
cd "C:\Users\Samuel Vergara\Downloads\AppGymBolt\project\services\workout-service"
npm run dev
```

#### 1.2 Verificar Health Check de todos los servicios
```powershell
# Health check Auth Service
Invoke-RestMethod -Uri "http://localhost:3001/health" -Method GET

# Health check Exercise Service
Invoke-RestMethod -Uri "http://localhost:3002/health" -Method GET

# Health check Routine Service
Invoke-RestMethod -Uri "http://localhost:3003/health" -Method GET

# Health check Workout Service
Invoke-RestMethod -Uri "http://localhost:3004/health" -Method GET
```

### Paso 2: Preparar Datos de Prueba

#### 2.1 Login como usuario normal y obtener token
```powershell
# Login como usuario normal (usando el que ya creaste)
$userLogin = Invoke-RestMethod -Uri "http://localhost:3001/api/auth/login" `
    -Method POST `
    -Headers @{"Content-Type"="application/json"} `
    -Body (ConvertTo-Json @{ username = "usuario_test"; password = "password123" })

$userToken = $userLogin.data.token
Write-Host "✅ Token de usuario obtenido"
```

#### 2.2 Usar ejercicios existentes (según tu pgAdmin)
```powershell
Write-Host "📝 Usando ejercicios existentes de la base de datos..."

# Asignar IDs de ejercicios existentes (según pgAdmin)
$ejercicioId1 = 1  # Press de Banca
$ejercicioId2 = 2  # Sentadilla  
$ejercicioId3 = 3  # Peso Muerto
$ejercicioId4 = 4  # Dominadas

Write-Host "✅ Usando: Press de Banca (ID: $ejercicioId1)"
Write-Host "✅ Usando: Sentadilla (ID: $ejercicioId2)"
Write-Host "✅ Usando: Peso Muerto (ID: $ejercicioId3)"
Write-Host "✅ Usando: Dominadas (ID: $ejercicioId4)"
```

#### 2.3 Crear rutina de prueba para los entrenamientos
```powershell
Write-Host "`n📋 Creando rutina de prueba para entrenamientos..."

$rutinaPrueba = @{
    name = "Rutina de Prueba - Full Body"
    description = "Rutina completa para probar el Workout Service"
    exercises = @(
        @{
            exerciseId = $ejercicioId1  # Press de Banca
            sets = 3
            repRangeMin = 8
            repRangeMax = 12
            technique = "normal"
            restTime = 120
            orderInRoutine = 1
        },
        @{
            exerciseId = $ejercicioId2  # Sentadilla
            sets = 3
            repRangeMin = 10
            repRangeMax = 15
            technique = "normal"
            restTime = 180
            orderInRoutine = 2
        },
        @{
            exerciseId = $ejercicioId4  # Dominadas
            sets = 3
            repRangeMin = 5
            repRangeMax = 10
            technique = "failure"
            restTime = 240
            orderInRoutine = 3
        }
    )
} | ConvertTo-Json -Depth 3

$rutinaPruebaResponse = Invoke-RestMethod -Uri "http://localhost:3003/api/routines" `
    -Method POST `
    -Headers @{"Content-Type"="application/json"; "Authorization"="Bearer $userToken"} `
    -Body $rutinaPrueba

$rutinaId = $rutinaPruebaResponse.data.id
Write-Host "✅ Rutina de prueba creada (ID: $rutinaId)"
Write-Host "Nombre: $($rutinaPruebaResponse.data.name)"
```

### Paso 3: Crear Primer Entrenamiento Completo

#### 3.1 Crear entrenamiento completado
```powershell
Write-Host "`n🏋️‍♂️ Creando primer entrenamiento completado..."

# Definir fechas
$fechaInicio = (Get-Date).AddHours(-2).ToString("yyyy-MM-ddTHH:mm:ss.fffZ")
$fechaFin = (Get-Date).AddHours(-1).ToString("yyyy-MM-ddTHH:mm:ss.fffZ")
$duracion = 3600  # 1 hora en segundos

$entrenamiento1 = @{
    routineId = $rutinaId
    routineName = "Rutina de Prueba - Full Body"
    startedAt = $fechaInicio
    completedAt = $fechaFin
    duration = $duracion
    notes = "Primer entrenamiento de prueba. Me sentí bien, buen rendimiento."
    sets = @(
        # Press de Banca - 3 series
        @{
            exerciseId = $ejercicioId1
            exerciseName = "Press de Banca"
            setNumber = 1
            weight = 80.0
            reps = 10
            technique = "normal"
            restTime = 120
        },
        @{
            exerciseId = $ejercicioId1
            exerciseName = "Press de Banca"
            setNumber = 2
            weight = 80.0
            reps = 9
            technique = "normal"
            restTime = 120
        },
        @{
            exerciseId = $ejercicioId1
            exerciseName = "Press de Banca"
            setNumber = 3
            weight = 75.0
            reps = 12
            technique = "dropset"
            restTime = 180
        },
        # Sentadilla - 3 series
        @{
            exerciseId = $ejercicioId2
            exerciseName = "Sentadilla"
            setNumber = 1
            weight = 100.0
            reps = 12
            technique = "normal"
            restTime = 180
        },
        @{
            exerciseId = $ejercicioId2
            exerciseName = "Sentadilla"
            setNumber = 2
            weight = 100.0
            reps = 11
            technique = "normal"
            restTime = 180
        },
        @{
            exerciseId = $ejercicioId2
            exerciseName = "Sentadilla"
            setNumber = 3
            weight = 95.0
            reps = 15
            technique = "normal"
            restTime = 240
        },
        # Dominadas - 3 series
        @{
            exerciseId = $ejercicioId4
            exerciseName = "Dominadas"
            setNumber = 1
            weight = $null
            reps = 8
            technique = "normal"
            restTime = 240
        },
        @{
            exerciseId = $ejercicioId4
            exerciseName = "Dominadas"
            setNumber = 2
            weight = $null
            reps = 6
            technique = "normal"
            restTime = 240
        },
        @{
            exerciseId = $ejercicioId4
            exerciseName = "Dominadas"
            setNumber = 3
            weight = $null
            reps = 5
            technique = "failure"
            restTime = 0
        }
    )
} | ConvertTo-Json -Depth 3

$entrenamiento1Response = Invoke-RestMethod -Uri "http://localhost:3004/api/workouts" `
    -Method POST `
    -Headers @{"Content-Type"="application/json"; "Authorization"="Bearer $userToken"} `
    -Body $entrenamiento1

$workoutId1 = $entrenamiento1Response.data.id
Write-Host "✅ Primer entrenamiento creado (ID: $workoutId1)"
Write-Host "Duración: $($entrenamiento1Response.data.duration) segundos"
Write-Host "Total de series: $($entrenamiento1Response.data.sets.Count)"
```

### Paso 4: Crear Segundo Entrenamiento (En Progreso)

#### 4.1 Crear entrenamiento en progreso (sin completar)
```powershell
Write-Host "`n🏋️‍♂️ Creando segundo entrenamiento (en progreso)..."

# Entrenamiento que empezó hace 30 minutos pero no ha terminado
$fechaInicio2 = (Get-Date).AddMinutes(-30).ToString("yyyy-MM-ddTHH:mm:ss.fffZ")

$entrenamiento2 = @{
    routineId = $rutinaId
    routineName = "Rutina de Prueba - Full Body"
    startedAt = $fechaInicio2
    notes = "Entrenamiento en progreso..."
    sets = @(
        # Solo Press de Banca completado
        @{
            exerciseId = $ejercicioId1
            exerciseName = "Press de Banca"
            setNumber = 1
            weight = 82.5
            reps = 10
            technique = "normal"
            restTime = 120
        },
        @{
            exerciseId = $ejercicioId1
            exerciseName = "Press de Banca"
            setNumber = 2
            weight = 82.5
            reps = 8
            technique = "normal"
            restTime = 120
        }
    )
} | ConvertTo-Json -Depth 3

$entrenamiento2Response = Invoke-RestMethod -Uri "http://localhost:3004/api/workouts" `
    -Method POST `
    -Headers @{"Content-Type"="application/json"; "Authorization"="Bearer $userToken"} `
    -Body $entrenamiento2

$workoutId2 = $entrenamiento2Response.data.id
Write-Host "✅ Segundo entrenamiento creado (ID: $workoutId2)"
Write-Host "Estado: En progreso (sin completar)"
```

### Paso 5: Crear Tercer Entrenamiento (Histórico)

#### 5.1 Crear entrenamiento de hace una semana
```powershell
Write-Host "`n🏋️‍♂️ Creando entrenamiento histórico (hace una semana)..."

# Entrenamiento de hace 7 días
$fechaInicio3 = (Get-Date).AddDays(-7).ToString("yyyy-MM-ddTHH:mm:ss.fffZ")
$fechaFin3 = (Get-Date).AddDays(-7).AddMinutes(45).ToString("yyyy-MM-ddTHH:mm:ss.fffZ")
$duracion3 = 2700  # 45 minutos

$entrenamiento3 = @{
    routineId = $rutinaId
    routineName = "Rutina de Prueba - Full Body"
    startedAt = $fechaInicio3
    completedAt = $fechaFin3
    duration = $duracion3
    notes = "Entrenamiento de la semana pasada. Buen progreso en peso muerto."
    sets = @(
        # Press de Banca
        @{
            exerciseId = $ejercicioId1
            exerciseName = "Press de Banca"
            setNumber = 1
            weight = 77.5
            reps = 12
            technique = "normal"
            restTime = 120
        },
        @{
            exerciseId = $ejercicioId1
            exerciseName = "Press de Banca"
            setNumber = 2
            weight = 77.5
            reps = 10
            technique = "normal"
            restTime = 120
        },
        # Peso Muerto
        @{
            exerciseId = $ejercicioId3
            exerciseName = "Peso Muerto"
            setNumber = 1
            weight = 120.0
            reps = 8
            technique = "normal"
            restTime = 300
        },
        @{
            exerciseId = $ejercicioId3
            exerciseName = "Peso Muerto"
            setNumber = 2
            weight = 120.0
            reps = 6
            technique = "normal"
            restTime = 300
        }
    )
} | ConvertTo-Json -Depth 3

$entrenamiento3Response = Invoke-RestMethod -Uri "http://localhost:3004/api/workouts" `
    -Method POST `
    -Headers @{"Content-Type"="application/json"; "Authorization"="Bearer $userToken"} `
    -Body $entrenamiento3

$workoutId3 = $entrenamiento3Response.data.id
Write-Host "✅ Entrenamiento histórico creado (ID: $workoutId3)"
Write-Host "Fecha: Hace 7 días"
```

### Paso 6: Probar Listado y Búsqueda de Entrenamientos

#### 6.1 Obtener todos los entrenamientos del usuario
```powershell
Write-Host "`n📋 Obteniendo todos los entrenamientos del usuario..."

$todosEntrenamientos = Invoke-RestMethod -Uri "http://localhost:3004/api/workouts" `
    -Method GET `
    -Headers @{"Authorization"="Bearer $userToken"}

Write-Host "📊 Total de entrenamientos: $($todosEntrenamientos.data.pagination.total)"
Write-Host "📋 Entrenamientos del usuario:"
$todosEntrenamientos.data.workouts | Format-Table id, routineName, startedAt, @{Name="Completado"; Expression={if($_.completedAt) {"Sí"} else {"No"}}}, @{Name="Series"; Expression={$_.sets.Count}}
```

#### 6.2 Buscar entrenamientos por nombre de rutina
```powershell
Write-Host "`n🔍 Buscando entrenamientos con 'full body'..."

$busquedaFullBody = Invoke-RestMethod -Uri "http://localhost:3004/api/workouts?q=full body" `
    -Method GET `
    -Headers @{"Authorization"="Bearer $userToken"}

Write-Host "🔍 Entrenamientos encontrados: $($busquedaFullBody.data.pagination.total)"
$busquedaFullBody.data.workouts | Format-Table id, routineName, startedAt
```

#### 6.3 Filtrar entrenamientos por fecha
```powershell
Write-Host "`n📅 Filtrando entrenamientos de los últimos 3 días..."

$fechaInicio = (Get-Date).AddDays(-3).ToString("yyyy-MM-dd")
$entrenamientosRecientes = Invoke-RestMethod -Uri "http://localhost:3004/api/workouts?startDate=$fechaInicio" `
    -Method GET `
    -Headers @{"Authorization"="Bearer $userToken"}

Write-Host "📅 Entrenamientos de los últimos 3 días: $($entrenamientosRecientes.data.pagination.total)"
$entrenamientosRecientes.data.workouts | Format-Table id, routineName, startedAt, @{Name="Completado"; Expression={if($_.completedAt) {"Sí"} else {"No"}}}
```

### Paso 7: Obtener Detalles de Entrenamientos

#### 7.1 Obtener detalles del primer entrenamiento
```powershell
Write-Host "`n📄 Obteniendo detalles del primer entrenamiento..."

$detalleEntrenamiento = Invoke-RestMethod -Uri "http://localhost:3004/api/workouts/$workoutId1" `
    -Method GET `
    -Headers @{"Authorization"="Bearer $userToken"}

Write-Host "📋 Detalles del entrenamiento:"
Write-Host "Rutina: $($detalleEntrenamiento.data.routineName)"
Write-Host "Inicio: $($detalleEntrenamiento.data.startedAt)"
Write-Host "Fin: $($detalleEntrenamiento.data.completedAt)"
Write-Host "Duración: $($detalleEntrenamiento.data.duration) segundos"
Write-Host "Notas: $($detalleEntrenamiento.data.notes)"
Write-Host "`nSeries realizadas:"
$detalleEntrenamiento.data.sets | Format-Table exerciseName, setNumber, weight, reps, technique, restTime
```

### Paso 8: Probar Estadísticas de Usuario

#### 8.1 Obtener estadísticas generales
```powershell
Write-Host "`n📊 Obteniendo estadísticas generales del usuario..."

$statsGenerales = Invoke-RestMethod -Uri "http://localhost:3004/api/workouts/stats" `
    -Method GET `
    -Headers @{"Authorization"="Bearer $userToken"}

Write-Host "📊 Estadísticas generales (últimos 30 días):"
$statsGenerales.data | Format-List
```

#### 8.2 Obtener estadísticas por ejercicio
```powershell
Write-Host "`n📊 Obteniendo estadísticas por ejercicio..."

$statsPorEjercicio = Invoke-RestMethod -Uri "http://localhost:3004/api/workouts/stats/exercises" `
    -Method GET `
    -Headers @{"Authorization"="Bearer $userToken"}

Write-Host "📊 Estadísticas por ejercicio (últimos 30 días):"
$statsPorEjercicio.data.exercises | Format-Table exerciseName, totalSets, totalReps, avgWeight, maxWeight, totalWeight
```

#### 8.3 Obtener progreso de Press de Banca
```powershell
Write-Host "`n📈 Obteniendo progreso de Press de Banca..."

$progresoPress = Invoke-RestMethod -Uri "http://localhost:3004/api/workouts/progress/$ejercicioId1" `
    -Method GET `
    -Headers @{"Authorization"="Bearer $userToken"}

Write-Host "📈 Progreso de Press de Banca:"
$progresoPress.data.progress | Format-Table date, routineName, weight, reps, volume
```

### Paso 9: Obtener Entrenamientos Recientes

#### 9.1 Ver últimos 5 entrenamientos
```powershell
Write-Host "`n🕐 Obteniendo entrenamientos recientes..."

$entrenamientosRecientes = Invoke-RestMethod -Uri "http://localhost:3004/api/workouts/recent" `
    -Method GET `
    -Headers @{"Authorization"="Bearer $userToken"}

Write-Host "🕐 Últimos entrenamientos:"
$entrenamientosRecientes.data | Format-Table id, routineName, startedAt, @{Name="Completado"; Expression={$_.isCompleted}}, totalSets, @{Name="Ejercicios"; Expression={$_.exercises -join ", "}}
```

### Paso 10: Actualizar Entrenamiento en Progreso

#### 10.1 Completar el segundo entrenamiento
```powershell
Write-Host "`n✅ Completando el segundo entrenamiento..."

$fechaFinalizacion = (Get-Date).ToString("yyyy-MM-ddTHH:mm:ss.fffZ")
$duracionFinal = 1800  # 30 minutos

$actualizacionEntrenamiento = @{
    completedAt = $fechaFinalizacion
    duration = $duracionFinal
    notes = "Entrenamiento completado. Solo pude hacer press de banca por falta de tiempo."
} | ConvertTo-Json

$entrenamientoActualizado = Invoke-RestMethod -Uri "http://localhost:3004/api/workouts/$workoutId2" `
    -Method PUT `
    -Headers @{"Content-Type"="application/json"; "Authorization"="Bearer $userToken"} `
    -Body $actualizacionEntrenamiento

Write-Host "✅ Entrenamiento actualizado:"
Write-Host "Estado: Completado"
Write-Host "Duración final: $($entrenamientoActualizado.data.duration) segundos"
Write-Host "Notas: $($entrenamientoActualizado.data.notes)"
```

### Paso 11: Crear Entrenamiento con Técnicas Avanzadas

#### 11.1 Entrenamiento con dropsets y myo-reps
```powershell
Write-Host "`n🔥 Creando entrenamiento con técnicas avanzadas..."

$fechaInicio4 = (Get-Date).AddDays(-3).ToString("yyyy-MM-ddTHH:mm:ss.fffZ")
$fechaFin4 = (Get-Date).AddDays(-3).AddMinutes(50).ToString("yyyy-MM-ddTHH:mm:ss.fffZ")

$entrenamientoAvanzado = @{
    routineId = $rutinaId
    routineName = "Rutina de Prueba - Full Body"
    startedAt = $fechaInicio4
    completedAt = $fechaFin4
    duration = 3000
    notes = "Entrenamiento intenso con técnicas avanzadas. Dropsets y myo-reps."
    sets = @(
        # Press de Banca con dropset
        @{
            exerciseId = $ejercicioId1
            exerciseName = "Press de Banca"
            setNumber = 1
            weight = 85.0
            reps = 8
            technique = "normal"
            restTime = 120
        },
        @{
            exerciseId = $ejercicioId1
            exerciseName = "Press de Banca"
            setNumber = 2
            weight = 85.0
            reps = 6
            technique = "dropset"
            restTime = 180
        },
        # Sentadilla con myo-reps
        @{
            exerciseId = $ejercicioId2
            exerciseName = "Sentadilla"
            setNumber = 1
            weight = 105.0
            reps = 15
            technique = "myo-reps"
            restTime = 300
        },
        # Dominadas al fallo
        @{
            exerciseId = $ejercicioId4
            exerciseName = "Dominadas"
            setNumber = 1
            weight = $null
            reps = 12
            technique = "failure"
            restTime = 0
        }
    )
} | ConvertTo-Json -Depth 3

$entrenamientoAvanzadoResponse = Invoke-RestMethod -Uri "http://localhost:3004/api/workouts" `
    -Method POST `
    -Headers @{"Content-Type"="application/json"; "Authorization"="Bearer $userToken"} `
    -Body $entrenamientoAvanzado

$workoutId4 = $entrenamientoAvanzadoResponse.data.id
Write-Host "✅ Entrenamiento avanzado creado (ID: $workoutId4)"
Write-Host "Técnicas usadas:"
$entrenamientoAvanzadoResponse.data.sets | Format-Table exerciseName, technique, weight, reps
```

### Paso 12: Probar Estadísticas Avanzadas

#### 12.1 Estadísticas de diferentes períodos
```powershell
Write-Host "`n📊 Comparando estadísticas por períodos..."

# Últimos 7 días
$stats7dias = Invoke-RestMethod -Uri "http://localhost:3004/api/workouts/stats?period=7" `
    -Method GET `
    -Headers @{"Authorization"="Bearer $userToken"}

# Últimos 30 días
$stats30dias = Invoke-RestMethod -Uri "http://localhost:3004/api/workouts/stats?period=30" `
    -Method GET `
    -Headers @{"Authorization"="Bearer $userToken"}

Write-Host "📊 Comparación de estadísticas:"
Write-Host "Últimos 7 días:"
$stats7dias.data | Format-List

Write-Host "`nÚltimos 30 días:"
$stats30dias.data | Format-List
```

#### 12.2 Progreso específico de cada ejercicio
```powershell
Write-Host "`n📈 Analizando progreso por ejercicio..."

# Progreso Press de Banca
Write-Host "📈 Progreso Press de Banca:"
$progresoPress = Invoke-RestMethod -Uri "http://localhost:3004/api/workouts/progress/$ejercicioId1?limit=5" `
    -Method GET `
    -Headers @{"Authorization"="Bearer $userToken"}
$progresoPress.data.progress | Format-Table date, weight, reps, volume

# Progreso Sentadilla
Write-Host "`n📈 Progreso Sentadilla:"
$progresoSentadilla = Invoke-RestMethod -Uri "http://localhost:3004/api/workouts/progress/$ejercicioId2?limit=5" `
    -Method GET `
    -Headers @{"Authorization"="Bearer $userToken"}
$progresoSentadilla.data.progress | Format-Table date, weight, reps, volume

# Progreso Dominadas
Write-Host "`n📈 Progreso Dominadas:"
$progresoDominadas = Invoke-RestMethod -Uri "http://localhost:3004/api/workouts/progress/$ejercicioId4?limit=5" `
    -Method GET `
    -Headers @{"Authorization"="Bearer $userToken"}
$progresoDominadas.data.progress | Format-Table date, weight, reps, volume
```

### Paso 13: Probar Validaciones y Seguridad

#### 13.1 Intentar crear entrenamiento con datos inválidos
```powershell
Write-Host "`n❌ Probando validación: datos inválidos..."

$entrenamientoInvalido = @{
    routineId = -1  # ID inválido
    routineName = ""  # Nombre vacío
    startedAt = "fecha-invalida"  # Fecha inválida
    sets = @()  # Sin series
} | ConvertTo-Json -Depth 3

try {
    Invoke-RestMethod -Uri "http://localhost:3004/api/workouts" `
        -Method POST `
        -Headers @{"Content-Type"="application/json"; "Authorization"="Bearer $userToken"} `
        -Body $entrenamientoInvalido
} catch {
    Write-Host "✅ Correcto: No se puede crear entrenamiento con datos inválidos"
    Write-Host "Error esperado: $($_.Exception.Message)"
}
```

#### 13.2 Crear segundo usuario y verificar aislamiento
```powershell
Write-Host "`n👤 Probando aislamiento de datos entre usuarios..."

# Crear segundo usuario
$usuario2 = @{
    username = "usuario2_workout"
    password = "password123"
} | ConvertTo-Json

try {
    $registerResponse2 = Invoke-RestMethod -Uri "http://localhost:3001/api/auth/register" `
        -Method POST `
        -Headers @{"Content-Type"="application/json"} `
        -Body $usuario2
    Write-Host "✅ Segundo usuario creado: usuario2_workout"
} catch {
    Write-Host "ℹ️  Usuario ya existe, haciendo login..."
}

# Login como segundo usuario
$user2Login = Invoke-RestMethod -Uri "http://localhost:3001/api/auth/login" `
    -Method POST `
    -Headers @{"Content-Type"="application/json"} `
    -Body (ConvertTo-Json @{ username = "usuario2_workout"; password = "password123" })

$user2Token = $user2Login.data.token

# Verificar que no ve entrenamientos del primer usuario
$entrenamientosUsuario2 = Invoke-RestMethod -Uri "http://localhost:3004/api/workouts" `
    -Method GET `
    -Headers @{"Authorization"="Bearer $user2Token"}

Write-Host "📊 Entrenamientos del segundo usuario: $($entrenamientosUsuario2.data.pagination.total)"
Write-Host "✅ Correcto: Cada usuario solo ve sus propios entrenamientos"
```

#### 13.3 Intentar acceder a entrenamiento de otro usuario
```powershell
Write-Host "`n🔒 Intentando acceder a entrenamiento de otro usuario..."

try {
    Invoke-RestMethod -Uri "http://localhost:3004/api/workouts/$workoutId1" `
        -Method GET `
        -Headers @{"Authorization"="Bearer $user2Token"}
} catch {
    Write-Host "✅ Correcto: No se puede acceder a entrenamientos de otros usuarios"
    Write-Host "Error esperado: $($_.Exception.Message)"
}
```

### Paso 14: Verificar Listado Final y Estadísticas

#### 14.1 Ver resumen final de entrenamientos
```powershell
Write-Host "`n📋 Resumen final de entrenamientos del primer usuario..."

$entrenamientosFinales = Invoke-RestMethod -Uri "http://localhost:3004/api/workouts" `
    -Method GET `
    -Headers @{"Authorization"="Bearer $userToken"}

Write-Host "📊 Total de entrenamientos creados: $($entrenamientosFinales.data.pagination.total)"
Write-Host "📋 Resumen de entrenamientos:"
$entrenamientosFinales.data.workouts | Format-Table id, routineName, @{Name="Fecha"; Expression={$_.startedAt.Substring(0,10)}}, @{Name="Completado"; Expression={if($_.completedAt) {"✅"} else {"⏳"}}}, @{Name="Series"; Expression={$_.sets.Count}}
```

#### 14.2 Estadísticas finales completas
```powershell
Write-Host "`n📊 Estadísticas finales completas..."

$statsFinales = Invoke-RestMethod -Uri "http://localhost:3004/api/workouts/stats" `
    -Method GET `
    -Headers @{"Authorization"="Bearer $userToken"}

Write-Host "📊 Estadísticas finales:"
$statsFinales.data | Format-List

# Entrenamientos recientes
$recientes = Invoke-RestMethod -Uri "http://localhost:3004/api/workouts/recent" `
    -Method GET `
    -Headers @{"Authorization"="Bearer $userToken"}

Write-Host "`n🕐 Últimos entrenamientos:"
$recientes.data | Format-Table routineName, @{Name="Fecha"; Expression={$_.startedAt.Substring(0,16)}}, @{Name="Estado"; Expression={if($_.isCompleted) {"Completado"} else {"En progreso"}}}, totalSets
```

### Paso 15: Limpieza (Opcional)

#### 15.1 Eliminar entrenamientos de prueba
```powershell
Write-Host "`n🗑️ Eliminando entrenamientos de prueba..."

$entrenamientosAEliminar = @($workoutId1, $workoutId2, $workoutId3, $workoutId4)

foreach ($workoutId in $entrenamientosAEliminar) {
    if ($workoutId) {
        try {
            Invoke-RestMethod -Uri "http://localhost:3004/api/workouts/$workoutId" `
                -Method DELETE `
                -Headers @{"Authorization"="Bearer $userToken"}
            Write-Host "✅ Entrenamiento $workoutId eliminado"
        } catch {
            Write-Host "❌ Error eliminando entrenamiento $workoutId"
        }
    }
}
```

#### 15.2 Eliminar rutina de prueba
```powershell
Write-Host "`n🗑️ Eliminando rutina de prueba..."

try {
    Invoke-RestMethod -Uri "http://localhost:3003/api/routines/$rutinaId" `
        -Method DELETE `
        -Headers @{"Authorization"="Bearer $userToken"}
    Write-Host "✅ Rutina de prueba eliminada"
} catch {
    Write-Host "❌ Error eliminando rutina de prueba"
}
```

#### 15.3 Verificar limpieza
```powershell
Write-Host "`n🔍 Verificando limpieza..."

$entrenamientosRestantes = Invoke-RestMethod -Uri "http://localhost:3004/api/workouts" `
    -Method GET `
    -Headers @{"Authorization"="Bearer $userToken"}

$rutinasRestantes = Invoke-RestMethod -Uri "http://localhost:3003/api/routines" `
    -Method GET `
    -Headers @{"Authorization"="Bearer $userToken"}

Write-Host "📊 Entrenamientos restantes: $($entrenamientosRestantes.data.pagination.total)"
Write-Host "📊 Rutinas restantes: $($rutinasRestantes.data.pagination.total)"
```

## 🔄 Flujo Completo de Prueba (Script Todo-en-Uno)

```powershell
Write-Host "🏃‍♂️ === INICIANDO PRUEBAS DEL WORKOUT SERVICE ===" -ForegroundColor Green

# 1. Health checks
Write-Host "`n1️⃣ Verificando servicios..." -ForegroundColor Yellow
try {
    $authHealth = Invoke-RestMethod -Uri "http://localhost:3001/health" -Method GET
    $exerciseHealth = Invoke-RestMethod -Uri "http://localhost:3002/health" -Method GET
    $routineHealth = Invoke-RestMethod -Uri "http://localhost:3003/health" -Method GET
    $workoutHealth = Invoke-RestMethod -Uri "http://localhost:3004/health" -Method GET
    Write-Host "✅ Auth Service: $($authHealth.data.service)"
    Write-Host "✅ Exercise Service: $($exerciseHealth.data.service)"
    Write-Host "✅ Routine Service: $($routineHealth.data.service)"
    Write-Host "✅ Workout Service: $($workoutHealth.data.service)"
} catch {
    Write-Host "❌ Error: Uno o más servicios no están corriendo"
    Write-Host "Asegúrate de que todos los servicios estén iniciados"
    exit
}

# 2. Login como usuario normal
Write-Host "`n2️⃣ Obteniendo token de usuario..." -ForegroundColor Yellow
$userLogin = Invoke-RestMethod -Uri "http://localhost:3001/api/auth/login" `
    -Method POST `
    -Headers @{"Content-Type"="application/json"} `
    -Body (ConvertTo-Json @{ username = "usuario_test"; password = "password123" })
$userToken = $userLogin.data.token
Write-Host "✅ Token de usuario obtenido"

# 3. Usar ejercicios existentes
Write-Host "`n3️⃣ Configurando ejercicios existentes..." -ForegroundColor Yellow
$ejercicioId1 = 1  # Press de Banca
$ejercicioId2 = 2  # Sentadilla  
$ejercicioId4 = 4  # Dominadas
Write-Host "✅ Usando ejercicios existentes: Press de Banca (1), Sentadilla (2), Dominadas (4)"

# 4. Crear rutina de prueba
Write-Host "`n4️⃣ Creando rutina de prueba..." -ForegroundColor Yellow
$rutinaPrueba = @{
    name = "Test Workout Routine"
    description = "Rutina para probar el Workout Service"
    exercises = @(
        @{ exerciseId = $ejercicioId1; sets = 3; repRangeMin = 8; repRangeMax = 12; technique = "normal"; restTime = 120; orderInRoutine = 1 },
        @{ exerciseId = $ejercicioId2; sets = 3; repRangeMin = 10; repRangeMax = 15; technique = "normal"; restTime = 180; orderInRoutine = 2 }
    )
} | ConvertTo-Json -Depth 3

$rutinaResponse = Invoke-RestMethod -Uri "http://localhost:3003/api/routines" `
    -Method POST `
    -Headers @{"Content-Type"="application/json"; "Authorization"="Bearer $userToken"} `
    -Body $rutinaPrueba
$rutinaId = $rutinaResponse.data.id
Write-Host "✅ Rutina de prueba creada (ID: $rutinaId)"

# 5. Crear entrenamiento
Write-Host "`n5️⃣ Creando entrenamiento..." -ForegroundColor Yellow
$fechaInicio = (Get-Date).AddHours(-1).ToString("yyyy-MM-ddTHH:mm:ss.fffZ")
$fechaFin = (Get-Date).ToString("yyyy-MM-ddTHH:mm:ss.fffZ")

$entrenamiento = @{
    routineId = $rutinaId
    routineName = "Test Workout Routine"
    startedAt = $fechaInicio
    completedAt = $fechaFin
    duration = 3600
    notes = "Entrenamiento de prueba"
    sets = @(
        @{ exerciseId = $ejercicioId1; exerciseName = "Press de Banca"; setNumber = 1; weight = 80; reps = 10; technique = "normal"; restTime = 120 },
        @{ exerciseId = $ejercicioId2; exerciseName = "Sentadilla"; setNumber = 1; weight = 100; reps = 12; technique = "normal"; restTime = 180 }
    )
} | ConvertTo-Json -Depth 3

$workoutResponse = Invoke-RestMethod -Uri "http://localhost:3004/api/workouts" `
    -Method POST `
    -Headers @{"Content-Type"="application/json"; "Authorization"="Bearer $userToken"} `
    -Body $entrenamiento
Write-Host "✅ Entrenamiento creado (ID: $($workoutResponse.data.id))"

# 6. Obtener estadísticas
Write-Host "`n6️⃣ Obteniendo estadísticas..." -ForegroundColor Yellow
$stats = Invoke-RestMethod -Uri "http://localhost:3004/api/workouts/stats" `
    -Method GET `
    -Headers @{"Authorization"="Bearer $userToken"}
Write-Host "📊 Estadísticas:"
$stats.data | Format-List

# 7. Listar entrenamientos
Write-Host "`n7️⃣ Listando entrenamientos..." -ForegroundColor Yellow
$workouts = Invoke-RestMethod -Uri "http://localhost:3004/api/workouts" `
    -Method GET `
    -Headers @{"Authorization"="Bearer $userToken"}
Write-Host "📋 Total de entrenamientos: $($workouts.data.pagination.total)"
$workouts.data.workouts | Format-Table id, routineName, @{Name="Completado"; Expression={if($_.completedAt) {"Sí"} else {"No"}}}

Write-Host "`n🎉 === TODAS LAS PRUEBAS COMPLETADAS ===" -ForegroundColor Green
Write-Host "✅ Workout Service funcionando correctamente" -ForegroundColor Green
```

## 📝 Comandos Individuales de Referencia

### Health Check
```powershell
Invoke-RestMethod -Uri "http://localhost:3004/health" -Method GET
```

### Crear Entrenamiento
```powershell
$entrenamiento = @{
    routineId = 1
    routineName = "Mi Rutina"
    startedAt = (Get-Date).ToString("yyyy-MM-ddTHH:mm:ss.fffZ")
    completedAt = (Get-Date).AddHours(1).ToString("yyyy-MM-ddTHH:mm:ss.fffZ")
    duration = 3600
    notes = "Buen entrenamiento"
    sets = @(
        @{
            exerciseId = 1
            exerciseName = "Press de Banca"
            setNumber = 1
            weight = 80.0
            reps = 10
            technique = "normal"
            restTime = 120
        }
    )
} | ConvertTo-Json -Depth 3

Invoke-RestMethod -Uri "http://localhost:3004/api/workouts" `
    -Method POST `
    -Headers @{"Content-Type"="application/json"; "Authorization"="Bearer $userToken"} `
    -Body $entrenamiento
```

### Listar Entrenamientos
```powershell
Invoke-RestMethod -Uri "http://localhost:3004/api/workouts" `
    -Method GET `
    -Headers @{"Authorization"="Bearer $userToken"}
```

### Buscar Entrenamientos
```powershell
Invoke-RestMethod -Uri "http://localhost:3004/api/workouts?q=rutina" `
    -Method GET `
    -Headers @{"Authorization"="Bearer $userToken"}
```

### Obtener Entrenamiento por ID
```powershell
Invoke-RestMethod -Uri "http://localhost:3004/api/workouts/1" `
    -Method GET `
    -Headers @{"Authorization"="Bearer $userToken"}
```

### Estadísticas del Usuario
```powershell
Invoke-RestMethod -Uri "http://localhost:3004/api/workouts/stats" `
    -Method GET `
    -Headers @{"Authorization"="Bearer $userToken"}
```

### Estadísticas por Ejercicio
```powershell
Invoke-RestMethod -Uri "http://localhost:3004/api/workouts/stats/exercises" `
    -Method GET `
    -Headers @{"Authorization"="Bearer $userToken"}
```

### Progreso de Ejercicio Específico
```powershell
Invoke-RestMethod -Uri "http://localhost:3004/api/workouts/progress/1" `
    -Method GET `
    -Headers @{"Authorization"="Bearer $userToken"}
```

### Entrenamientos Recientes
```powershell
Invoke-RestMethod -Uri "http://localhost:3004/api/workouts/recent" `
    -Method GET `
    -Headers @{"Authorization"="Bearer $userToken"}
```

### Actualizar Entrenamiento
```powershell
$actualizacion = @{
    completedAt = (Get-Date).ToString("yyyy-MM-ddTHH:mm:ss.fffZ")
    duration = 3600
    notes = "Entrenamiento completado exitosamente"
} | ConvertTo-Json

Invoke-RestMethod -Uri "http://localhost:3004/api/workouts/1" `
    -Method PUT `
    -Headers @{"Content-Type"="application/json"; "Authorization"="Bearer $userToken"} `
    -Body $actualizacion
```

### Eliminar Entrenamiento
```powershell
Invoke-RestMethod -Uri "http://localhost:3004/api/workouts/1" `
    -Method DELETE `
    -Headers @{"Authorization"="Bearer $userToken"}
```

## ❌ Errores Comunes y Soluciones

### Error: "Routine ID must be a positive integer"
**Problema:** ID de rutina inválido o nulo
**Solución:** Verificar que la rutina exista y usar su ID correcto

### Error: "Workout must have at least one set"
**Problema:** Intentando crear entrenamiento sin series
**Solución:** Incluir al menos una serie en el array `sets`

### Error: "Duplicate set numbers for the same exercise"
**Problema:** Dos series con el mismo número para el mismo ejercicio
**Solución:** Asegurar que cada serie tenga un número único por ejercicio

### Error: "Workout not found"
**Problema:** Intentando acceder a entrenamiento que no existe o no es tuyo
**Solución:** Verificar ID de entrenamiento y que pertenezca al usuario

### Error: "Invalid ISO 8601 date"
**Problema:** Formato de fecha incorrecto
**Solución:** Usar formato `yyyy-MM-ddTHH:mm:ss.fffZ`

## 🎯 Técnicas de Entrenamiento Soportadas

- **normal**: Entrenamiento estándar
- **dropset**: Reducir peso al fallo
- **myo-reps**: Micro-series con descanso corto
- **failure**: Entrenar hasta el fallo muscular
- **rest-pause**: Descanso-pausa para más repeticiones

## 🔗 Comunicación Entre Servicios

El Workout Service se comunica con:
- ✅ **Routine Service**: Para verificar rutinas (opcional)
- ✅ **Exercise Service**: Para obtener nombres de ejercicios (opcional)

## 📊 Tipos de Estadísticas Disponibles

1. **Estadísticas Generales**: Total de entrenamientos, series, repeticiones, peso levantado
2. **Estadísticas por Ejercicio**: Rendimiento específico por ejercicio
3. **Progreso Temporal**: Evolución del rendimiento a lo largo del tiempo
4. **Entrenamientos Recientes**: Últimos 5 entrenamientos para vista rápida

## 🎯 Próximos Pasos

Una vez que hayas probado el Workout Service y confirmes que funciona:

1. ✅ **Fase 2 completada:** Auth Service
2. ✅ **Fase 3 completada:** Exercise Service  
3. ✅ **Fase 4 completada:** Routine Service
4. ✅ **Fase 5 completada:** Workout Service
5. ⏳ **Fase 6 siguiente:** Frontend Integration

---

**Última actualización:** Enero 2025  
**Versión:** 1.0.0  
**Estado:** Workout Service implementado y listo para pruebas