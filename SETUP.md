# 📱 Guía de Configuración Local y Despliegue Gratuito

Esta guía te explica paso a paso cómo configurar la aplicación Fitness App localmente y cómo desplegarla de forma completamente gratuita para acceder desde cualquier dispositivo.

## 🏠 Configuración Local

### Prerrequisitos

1. **Node.js** (versión 18 o superior)
   - Descargar desde: https://nodejs.org/
   - Verificar instalación: `node --version`

2. **PostgreSQL** 
   - Descargar desde: https://www.postgresql.org/download/
   - O usar PostgreSQL portable
   - Verificar instalación: `psql --version`

3. **pgAdmin** (opcional pero recomendado)
   - Descargar desde: https://www.pgadmin.org/download/
   - Para gestión visual de bases de datos

4. **Git**
   - Descargar desde: https://git-scm.com/

### Paso 1: Clonar y Configurar el Proyecto

```bash
# Clonar el repositorio
git clone <tu-repositorio>
cd fitness-app

# Instalar dependencias del frontend
cd frontend
npm install
cd ..

# Instalar dependencias de cada microservicio
cd services/auth-service
npm install
cd ../exercise-service
npm install
cd ../routine-service
npm install
cd ../workout-service
npm install
cd ../..
```

### Paso 2: Configurar PostgreSQL

#### Opción A: PostgreSQL Instalado
1. Abrir pgAdmin o conectar por terminal
2. Crear las siguientes bases de datos:
   ```sql
   CREATE DATABASE fitness_auth_db;
   CREATE DATABASE fitness_exercise_db;
   CREATE DATABASE fitness_routine_db;
   CREATE DATABASE fitness_workout_db;
   ```

#### Opción B: PostgreSQL Portable (Más fácil)
1. Descargar PostgreSQL Portable
2. Ejecutar y configurar usuario/contraseña
3. Crear las bases de datos usando la interfaz

### Paso 3: Configurar Variables de Entorno

Crear archivo `.env` en cada servicio:

**services/auth-service/.env**
```env
DATABASE_URL=postgresql://usuario:contraseña@localhost:5432/fitness_auth_db
JWT_SECRET=tu-clave-secreta-muy-segura-aqui
PORT=3001
NODE_ENV=development
```

**services/exercise-service/.env**
```env
DATABASE_URL=postgresql://usuario:contraseña@localhost:5432/fitness_exercise_db
JWT_SECRET=tu-clave-secreta-muy-segura-aqui
PORT=3002
NODE_ENV=development
UPLOAD_PATH=./uploads
MAX_FILE_SIZE=50MB
```

**services/routine-service/.env**
```env
DATABASE_URL=postgresql://usuario:contraseña@localhost:5432/fitness_routine_db
JWT_SECRET=tu-clave-secreta-muy-segura-aqui
PORT=3003
NODE_ENV=development
EXERCISE_SERVICE_URL=http://localhost:3002
```

**services/workout-service/.env**
```env
DATABASE_URL=postgresql://usuario:contraseña@localhost:5432/fitness_workout_db
JWT_SECRET=tu-clave-secreta-muy-segura-aqui
PORT=3004
NODE_ENV=development
ROUTINE_SERVICE_URL=http://localhost:3003
EXERCISE_SERVICE_URL=http://localhost:3002
```

**frontend/.env**
```env
VITE_AUTH_SERVICE_URL=http://localhost:3001
VITE_EXERCISE_SERVICE_URL=http://localhost:3002
VITE_ROUTINE_SERVICE_URL=http://localhost:3003
VITE_WORKOUT_SERVICE_URL=http://localhost:3004
```

### Paso 4: Ejecutar la Aplicación

#### Opción A: Ejecutar Manualmente (Recomendado para desarrollo)

Abrir 5 terminales diferentes:

**Terminal 1 - Auth Service:**
```bash
cd services/auth-service
npm run dev
```

**Terminal 2 - Exercise Service:**
```bash
cd services/exercise-service
npm run dev
```

**Terminal 3 - Routine Service:**
```bash
cd services/routine-service
npm run dev
```

**Terminal 4 - Workout Service:**
```bash
cd services/workout-service
npm run dev
```

**Terminal 5 - Frontend:**
```bash
cd frontend
npm run dev
```

#### Opción B: Script de Inicio Automático

Crear `start-all.js` en la raíz del proyecto:
```javascript
const { spawn } = require('child_process');
const path = require('path');

const services = [
  { name: 'Auth Service', dir: 'services/auth-service', port: 3001 },
  { name: 'Exercise Service', dir: 'services/exercise-service', port: 3002 },
  { name: 'Routine Service', dir: 'services/routine-service', port: 3003 },
  { name: 'Workout Service', dir: 'services/workout-service', port: 3004 },
  { name: 'Frontend', dir: 'frontend', port: 5173 }
];

services.forEach(service => {
  const child = spawn('npm', ['run', 'dev'], {
    cwd: path.join(__dirname, service.dir),
    stdio: 'inherit',
    shell: true
  });
  
  console.log(`🚀 ${service.name} iniciado en puerto ${service.port}`);
});
```

Ejecutar con: `node start-all.js`

### Paso 5: Verificar que Todo Funciona

1. **Frontend**: http://localhost:5173
2. **Auth Service**: http://localhost:3001/api/auth/health
3. **Exercise Service**: http://localhost:3002/api/exercises/health
4. **Routine Service**: http://localhost:3003/api/routines/health
5. **Workout Service**: http://localhost:3004/api/workouts/health

## 📱 Acceso desde Celular (Red Local)

### Paso 1: Obtener IP Local

**Windows:**
```cmd
ipconfig
# Buscar "Dirección IPv4" (ej: 192.168.1.100)
```

**Mac/Linux:**
```bash
ifconfig | grep inet
# Buscar tu IP local (ej: 192.168.1.100)
```

### Paso 2: Configurar CORS en los Servicios

En cada servicio, modificar el archivo `src/app.js` o `src/server.js`:

```javascript
const cors = require('cors');

app.use(cors({
  origin: [
    'http://localhost:5173',
    'http://192.168.1.100:5173', // Tu IP local
    'http://0.0.0.0:5173'
  ],
  credentials: true
}));
```

### Paso 3: Actualizar Variables de Entorno para Móvil

**frontend/.env.mobile** (crear este archivo):
```env
VITE_AUTH_SERVICE_URL=http://192.168.1.100:3001
VITE_EXERCISE_SERVICE_URL=http://192.168.1.100:3002
VITE_ROUTINE_SERVICE_URL=http://192.168.1.100:3003
VITE_WORKOUT_SERVICE_URL=http://192.168.1.100:3004
```

### Paso 4: Ejecutar Frontend para Móvil

```bash
cd frontend
cp .env.mobile .env
npm run dev -- --host 0.0.0.0
```

### Paso 5: Acceder desde el Celular

1. Conectar el celular a la misma red WiFi
2. Abrir navegador en el celular
3. Ir a: `http://192.168.1.100:5173`

## 🌐 Despliegue Gratuito

### Opción 1: Railway (Recomendado) - Completamente Gratis

**Características:**
- 500 horas gratis al mes
- Base de datos PostgreSQL incluida
- Despliegue automático desde GitHub

**Pasos:**

1. **Preparar el Código:**
   ```bash
   # Crear Procfile para cada servicio
   echo "web: npm start" > services/auth-service/Procfile
   echo "web: npm start" > services/exercise-service/Procfile
   echo "web: npm start" > services/routine-service/Procfile
   echo "web: npm start" > services/workout-service/Procfile
   ```

2. **Subir a GitHub:**
   ```bash
   git add .
   git commit -m "Preparar para despliegue"
   git push origin main
   ```

3. **Configurar Railway:**
   - Ir a https://railway.app/
   - Conectar con GitHub
   - Crear nuevo proyecto
   - Seleccionar tu repositorio
   - Desplegar cada servicio por separado

4. **Configurar Base de Datos:**
   - En Railway, añadir PostgreSQL plugin
   - Copiar DATABASE_URL generada
   - Configurar variables de entorno en cada servicio

5. **Variables de Entorno en Railway:**
   Para cada servicio, configurar:
   ```
   DATABASE_URL=<url-generada-por-railway>
   JWT_SECRET=tu-clave-secreta
   NODE_ENV=production
   ```

### Opción 2: Render + Supabase - Completamente Gratis

**Render (Backend):**
- 750 horas gratis al mes
- Despliegue automático

**Supabase (Base de Datos):**
- 500MB gratis
- PostgreSQL completo

**Pasos:**

1. **Configurar Supabase:**
   - Ir a https://supabase.com/
   - Crear cuenta gratuita
   - Crear nuevo proyecto
   - Obtener DATABASE_URL de Settings > Database

2. **Configurar Render:**
   - Ir a https://render.com/
   - Conectar GitHub
   - Crear Web Service para cada microservicio
   - Configurar variables de entorno

3. **Desplegar Frontend en Netlify:**
   - Ir a https://netlify.com/
   - Conectar GitHub
   - Desplegar carpeta `frontend/`
   - Configurar variables de entorno con URLs de Render

### Opción 3: Vercel + PlanetScale - Completamente Gratis

**Vercel (Frontend + Serverless Functions):**
- Despliegues ilimitados
- Funciones serverless gratuitas

**PlanetScale (Base de Datos):**
- 1GB gratis
- MySQL compatible

### Configuración de Producción

**package.json** para cada servicio:
```json
{
  "scripts": {
    "start": "node src/server.js",
    "dev": "nodemon src/server.js",
    "build": "echo 'No build needed'"
  },
  "engines": {
    "node": "18.x"
  }
}
```

**Dockerfile** (opcional, para más control):
```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
EXPOSE 3001
CMD ["npm", "start"]
```

## 🔧 Solución de Problemas Comunes

### Error de Conexión a Base de Datos
```bash
# Verificar que PostgreSQL esté ejecutándose
sudo service postgresql status

# Reiniciar PostgreSQL
sudo service postgresql restart
```

### Error de CORS en Móvil
- Verificar que la IP sea correcta
- Asegurar que todos los servicios tengan CORS configurado
- Verificar que el firewall no bloquee los puertos

### Puertos Ocupados
```bash
# Ver qué proceso usa el puerto
lsof -i :3001

# Matar proceso
kill -9 <PID>
```

### Error de Permisos en Uploads
```bash
# Dar permisos a carpeta uploads
chmod 755 services/exercise-service/uploads
```

## 📊 Monitoreo y Logs

### Logs Locales
```bash
# Ver logs de un servicio específico
cd services/auth-service
npm run dev 2>&1 | tee logs.txt
```

### Logs en Producción
- **Railway**: Ver logs en dashboard
- **Render**: Ver logs en dashboard
- **Vercel**: Ver logs en dashboard

## 🚀 Comandos Útiles

```bash
# Reiniciar todos los servicios
pkill -f "node.*fitness"
node start-all.js

# Limpiar node_modules
find . -name "node_modules" -type d -exec rm -rf {} +
npm install

# Backup de base de datos
pg_dump fitness_auth_db > backup.sql

# Restaurar base de datos
psql fitness_auth_db < backup.sql
```

## 📱 PWA (Progressive Web App)

Para hacer la app instalable en móviles, agregar en `frontend/public/`:

**manifest.json:**
```json
{
  "name": "Fitness App",
  "short_name": "FitnessApp",
  "description": "Gestión de rutinas de entrenamiento",
  "start_url": "/",
  "display": "standalone",
  "background_color": "#ffffff",
  "theme_color": "#000000",
  "icons": [
    {
      "src": "/icon-192.png",
      "sizes": "192x192",
      "type": "image/png"
    }
  ]
}
```

## 🎯 Próximos Pasos

1. ✅ Configurar entorno local
2. ✅ Probar en móvil
3. ✅ Desplegar en producción
4. 📱 Configurar PWA
5. 📊 Añadir analytics
6. 🔔 Configurar notificaciones push

---

**¿Necesitas ayuda?** 
- Revisa los logs de cada servicio
- Verifica que todas las variables de entorno estén configuradas
- Asegúrate de que PostgreSQL esté ejecutándose
- Comprueba que todos los puertos estén disponibles