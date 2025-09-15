# 🔧 Guía Completa de Prisma ORM para Fitness App

Esta guía te explica cómo usar Prisma ORM en cada microservicio de la aplicación Fitness App.

## 📋 Índice
1. [¿Qué es Prisma y por qué lo usamos?](#qué-es-prisma)
2. [Configuración inicial](#configuración-inicial)
3. [Migraciones: Cuándo y cómo ejecutarlas](#migraciones)
4. [Comandos esenciales por servicio](#comandos-esenciales)
5. [Flujo de trabajo completo](#flujo-de-trabajo)
6. [Solución de problemas](#solución-de-problemas)

## 🎯 ¿Qué es Prisma?

Prisma es un ORM (Object-Relational Mapping) moderno que:
- ✅ Genera automáticamente un cliente TypeScript type-safe
- ✅ Maneja migraciones de base de datos de forma segura
- ✅ Proporciona una API intuitiva para consultas
- ✅ Incluye herramientas de desarrollo como Prisma Studio

## 🚀 Configuración Inicial

### Paso 1: Instalar dependencias en cada servicio

Ya están configuradas en los `package.json`, pero si necesitas instalarlas manualmente:

```bash
# En cada servicio (auth-service, exercise-service, etc.)
npm install @prisma/client
npm install prisma --save-dev
```

### Paso 2: Verificar archivos de configuración

Cada servicio ya tiene:
- ✅ `prisma/schema.prisma` - Define el esquema de la base de datos
- ✅ `.env` - Variables de entorno con DATABASE_URL
- ✅ `src/config/database.js` - Configuración del cliente Prisma

## 🔄 Migraciones: Cuándo y Cómo Ejecutarlas

### ¿Cuándo ejecutar migraciones?

**SIEMPRE ejecuta migraciones cuando:**
- 🆕 Es la primera vez que configuras el proyecto
- 🔄 Cambias el esquema en `prisma/schema.prisma`
- 👥 Un compañero de equipo hace cambios en el esquema
- 🐛 Las tablas no aparecen en tu base de datos

### Migración Inicial (PRIMERA VEZ)

**Ejecuta estos comandos EN ORDEN para cada servicio:**

#### 1. Auth Service
```bash
cd services/auth-service

# Generar el cliente Prisma
npx prisma generate

# Crear y aplicar la migración inicial
npx prisma migrate dev --name init

# Verificar que todo esté bien
npx prisma db push
```

#### 2. Exercise Service
```bash
cd services/exercise-service

# Generar el cliente Prisma
npx prisma generate

# Crear y aplicar la migración inicial
npx prisma migrate dev --name init

# Verificar que todo esté bien
npx prisma db push
```

#### 3. Routine Service
```bash
cd services/routine-service

# Generar el cliente Prisma
npx prisma generate

# Crear y aplicar la migración inicial
npx prisma migrate dev --name init

# Verificar que todo esté bien
npx prisma db push
```

#### 4. Workout Service
```bash
cd services/workout-service

# Generar el cliente Prisma
npx prisma generate

# Crear y aplicar la migración inicial
npx prisma migrate dev --name init

# Verificar que todo esté bien
npx prisma db push
```

### Verificar en PgAdmin

Después de ejecutar las migraciones, deberías ver en PgAdmin:

**Base de datos `fitness_auth_db`:**
- Tabla: `users`
- Tabla: `_prisma_migrations`

**Base de datos `fitness_exercise_db`:**
- Tabla: `exercises`
- Tabla: `exercise_aliases`
- Tabla: `_prisma_migrations`

**Base de datos `fitness_routine_db`:**
- Tabla: `routines`
- Tabla: `routine_exercises`
- Tabla: `_prisma_migrations`

**Base de datos `fitness_workout_db`:**
- Tabla: `workouts`
- Tabla: `workout_sets`
- Tabla: `_prisma_migrations`

## 📝 Comandos Esenciales por Servicio

### Comandos que usarás frecuentemente:

```bash
# Generar cliente después de cambios en schema
npx prisma generate

# Crear nueva migración después de cambios
npx prisma migrate dev --name nombre_descriptivo

# Aplicar cambios sin crear migración (desarrollo)
npx prisma db push

# Abrir Prisma Studio (interfaz visual)
npx prisma studio

# Ver estado de migraciones
npx prisma migrate status

# Resetear base de datos (¡CUIDADO! Borra todos los datos)
npx prisma migrate reset
```

## 🔄 Flujo de Trabajo Completo

### Configuración inicial (Solo la primera vez)

1. **Asegúrate de que PostgreSQL esté corriendo**
2. **Verifica que las bases de datos existan en PgAdmin:**
   - `fitness_auth_db`
   - `fitness_exercise_db`
   - `fitness_routine_db`
   - `fitness_workout_db`

3. **Ejecuta migraciones iniciales:**
```bash
# Script para ejecutar todo de una vez
cd services/auth-service && npx prisma generate && npx prisma migrate dev --name init
cd ../exercise-service && npx prisma generate && npx prisma migrate dev --name init
cd ../routine-service && npx prisma generate && npx prisma migrate dev --name init
cd ../workout-service && npx prisma generate && npx prisma migrate dev --name init
```

4. **Inicia los servicios:**
```bash
# Terminal 1
cd services/auth-service && npm run dev

# Terminal 2
cd services/exercise-service && npm run dev

# Terminal 3
cd services/routine-service && npm run dev

# Terminal 4
cd services/workout-service && npm run dev

# Terminal 5
cd frontend && npm run dev
```

### Cuando cambies el esquema

1. **Modifica `prisma/schema.prisma`**
2. **Genera nueva migración:**
```bash
npx prisma migrate dev --name descripcion_del_cambio
```
3. **El cliente se regenera automáticamente**

### Desarrollo diario

```bash
# Solo necesitas esto para desarrollo rápido
npx prisma db push

# Y esto si quieres ver los datos
npx prisma studio
```

## 🛠 Solución de Problemas

### Error: "Environment variable not found: DATABASE_URL"
```bash
# Verifica que el archivo .env existe y tiene:
DATABASE_URL="postgresql://postgres:Colombia10.@localhost:5432/fitness_auth_db"
```

### Error: "Can't reach database server"
```bash
# Verifica que PostgreSQL esté corriendo
# En Windows: Servicios > PostgreSQL
# En Mac: brew services start postgresql
# En Linux: sudo service postgresql start
```

### Error: "Database does not exist"
```bash
# Crea la base de datos en PgAdmin primero
# Luego ejecuta:
npx prisma db push
```

### Las tablas no aparecen en PgAdmin
```bash
# Ejecuta la migración:
npx prisma migrate dev --name init

# O fuerza la sincronización:
npx prisma db push
```

### Error: "Migration failed"
```bash
# Resetea las migraciones (¡CUIDADO! Borra datos):
npx prisma migrate reset

# O aplica manualmente:
npx prisma db push
```

### Quiero empezar de cero
```bash
# En cada servicio:
rm -rf prisma/migrations
npx prisma migrate reset
npx prisma migrate dev --name init
```

## 🎨 Prisma Studio

Para ver y editar datos visualmente:

```bash
# En cualquier servicio
npx prisma studio
```

Esto abre una interfaz web en `http://localhost:5555` donde puedes:
- ✅ Ver todas las tablas
- ✅ Editar registros
- ✅ Crear nuevos datos
- ✅ Ejecutar consultas

## 📊 Esquemas por Servicio

### Auth Service (`fitness_auth_db`)
```prisma
model User {
  id           Int      @id @default(autoincrement())
  username     String   @unique
  passwordHash String
  role         String   @default("user")
  createdAt    DateTime @default(now())
  updatedAt    DateTime @updatedAt
}
```

### Exercise Service (`fitness_exercise_db`)
```prisma
model Exercise {
  id          Int      @id @default(autoincrement())
  name        String
  description String?
  videoPath   String?
  createdBy   Int
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
  aliases     ExerciseAlias[]
}

model ExerciseAlias {
  id         Int      @id @default(autoincrement())
  exerciseId Int
  alias      String
  createdAt  DateTime @default(now())
  exercise   Exercise @relation(fields: [exerciseId], references: [id])
}
```

### Routine Service (`fitness_routine_db`)
```prisma
model Routine {
  id          Int      @id @default(autoincrement())
  userId      Int
  name        String
  description String?
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
  exercises   RoutineExercise[]
}

model RoutineExercise {
  id              Int     @id @default(autoincrement())
  routineId       Int
  exerciseId      Int
  sets            Int
  repRangeMin     Int?
  repRangeMax     Int?
  technique       String  @default("normal")
  restTime        Int?
  orderInRoutine  Int
  createdAt       DateTime @default(now())
  routine         Routine @relation(fields: [routineId], references: [id])
}
```

### Workout Service (`fitness_workout_db`)
```prisma
model Workout {
  id          Int       @id @default(autoincrement())
  userId      Int
  routineId   Int
  routineName String
  startedAt   DateTime
  completedAt DateTime?
  duration    Int?
  notes       String?
  createdAt   DateTime  @default(now())
  sets        WorkoutSet[]
}

model WorkoutSet {
  id           Int      @id @default(autoincrement())
  workoutId    Int
  exerciseId   Int
  exerciseName String
  setNumber    Int
  weight       Decimal?
  reps         Int
  technique    String   @default("normal")
  restTime     Int?
  completedAt  DateTime @default(now())
  workout      Workout  @relation(fields: [workoutId], references: [id])
}
```

## 🚀 Comandos Rápidos de Referencia

```bash
# Configuración inicial completa
npm install && npx prisma generate && npx prisma migrate dev --name init

# Desarrollo diario
npx prisma db push

# Ver datos
npx prisma studio

# Nueva migración
npx prisma migrate dev --name nombre_descriptivo

# Regenerar cliente
npx prisma generate

# Estado de migraciones
npx prisma migrate status

# Resetear todo (¡CUIDADO!)
npx prisma migrate reset
```

---

**¡Importante!** Siempre ejecuta `npx prisma generate` después de cambiar el esquema para que el cliente TypeScript se actualice con los nuevos tipos.