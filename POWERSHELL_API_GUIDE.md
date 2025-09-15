# 🔧 Guía de Comandos PowerShell para Probar APIs

Esta guía contiene los comandos correctos de PowerShell para probar los endpoints del Auth Service de la Fitness App.

## 📋 Prerrequisitos

1. **Auth Service debe estar corriendo:**
   ```bash
   cd services/auth-service
   npm run dev
   ```
   Deberías ver: `🔐 Auth Service running on port 3001`

2. **PostgreSQL debe estar corriendo y conectado**
3. **Usar PowerShell (no Command Prompt)**

## 🚀 Comandos de Prueba

### 1. Registrar un Nuevo Usuario

```powershell
$body = @{
    username = "miusuario"
    password = "micontrasena123"
} | ConvertTo-Json

Invoke-RestMethod -Uri "http://localhost:3001/api/auth/register" `
    -Method POST `
    -Headers @{"Content-Type"="application/json"} `
    -Body $body
```

**Respuesta esperada:**
```
success message                      data
------- -------                      ----
   True User registered successfully @{token=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

### 2. Iniciar Sesión y Capturar Token Completo

```powershell
# Hacer login y guardar la respuesta completa
$loginResponse = Invoke-RestMethod -Uri "http://localhost:3001/api/auth/login" `
    -Method POST `
    -Headers @{"Content-Type"="application/json"} `
    -Body (ConvertTo-Json @{ username = "miusuario"; password = "micontrasena123" })

# Extraer el token completo
$fullToken = $loginResponse.data.token

# Mostrar el token completo
Write-Host "Token completo: $fullToken"
```

**Respuesta esperada:**
```
success message          data
------- -------          ----
   True Login successful @{token=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

Token completo: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjIsInVzZXJuYW1lIjoibWl1c3VhcmlvIiwicm9sZSI6InVzZXIiLCJpYXQiOjE3NTY0MTU0MzUsImV4cCI6MTc1NzAyMDIzNX0.4xytlIOpMMTLVouc-BvGLTXc73Il0d4wzeTg4b_Q2yY
```

### 3. Obtener Perfil del Usuario (Usando Token)

```powershell
# Usar el token capturado anteriormente
Invoke-RestMethod -Uri "http://localhost:3001/api/auth/profile" `
    -Method GET `
    -Headers @{"Authorization"="Bearer $fullToken"}
```

**Respuesta esperada:**
```
success message                        data
------- -------                        ----
   True Profile retrieved successfully @{id=2; username=miusuario; role=user; createdAt=2025-08-28T21:05:35.952Z; updatedAt=2025-08-28T21:10:35.633Z}
```

### 4. Verificar Token (Opcional)

```powershell
$verifyBody = @{
    token = $fullToken
} | ConvertTo-Json

Invoke-RestMethod -Uri "http://localhost:3001/api/auth/verify-token" `
    -Method POST `
    -Headers @{"Content-Type"="application/json"} `
    -Body $verifyBody
```

### 5. Health Check del Servicio

```powershell
Invoke-RestMethod -Uri "http://localhost:3001/health" -Method GET
```


## ❌ Errores Comunes y Soluciones

### Error: "URL rejected: Malformed input"
**Problema:** Usar `curl.exe` con sintaxis incorrecta en PowerShell
**Solución:** Usar `Invoke-RestMethod` como se muestra arriba

### Error: "SyntaxError: Expected property name"
**Problema:** JSON mal formado en el cuerpo de la solicitud
**Solución:** Usar `ConvertTo-Json` para generar JSON válido

### Error: "Access token required"
**Problema:** No incluir el token en la cabecera Authorization
**Solución:** Asegurar que el token esté en formato `Bearer $token`

### Error: "Invalid or expired token"
**Problema:** Token expirado o mal formado
**Solución:** Hacer login nuevamente para obtener un token fresco

## 🎯 Notas Importantes

1. **Los tokens JWT expiran en 7 días** - Si obtienes errores de token inválido, haz login nuevamente
2. **Cada usuario debe tener un username único** - Si intentas registrar un usuario que ya existe, obtendrás un error
3. **Las contraseñas deben tener al menos 6 caracteres** y contener al menos una letra y un número
4. **El usuario admin ya existe** con credenciales `admin` / `admin123`

## 🔍 Comandos de Depuración

### Ver respuesta completa con detalles
```powershell
$response = Invoke-RestMethod -Uri "http://localhost:3001/api/auth/profile" `
    -Method GET `
    -Headers @{"Authorization"="Bearer $fullToken"} `
    -Verbose

$response | ConvertTo-Json -Depth 3
```

### Probar con usuario admin
```powershell
$adminLogin = Invoke-RestMethod -Uri "http://localhost:3001/api/auth/login" `
    -Method POST `
    -Headers @{"Content-Type"="application/json"} `
    -Body (ConvertTo-Json @{ username = "admin"; password = "admin123" })

$adminToken = $adminLogin.data.token
Write-Host "Admin token: $adminToken"
```

---

**Última actualización:** Enero 2025  
**Versión:** 1.0.0  
**Estado:** Verificado y funcionando