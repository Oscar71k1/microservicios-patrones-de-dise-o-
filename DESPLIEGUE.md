# 🚀 Guía de Despliegue - Sistema de Inscripciones y Pagos

## Configuración Inicial

### 1. Configurar Firebase

1. **Crear proyecto en Firebase Console**
   - Ve a [Firebase Console](https://console.firebase.google.com)
   - Crea un nuevo proyecto
   - Habilita Firestore Database
   - Ve a "Configuración del proyecto" > "Cuentas de servicio"
   - Genera una nueva clave privada (JSON)
   - Descarga el archivo JSON

2. **Configurar credenciales**
   ```bash
   # Copia el archivo descargado como firebase-config.json en la raíz del proyecto
   cp ruta/al/archivo-descargado.json firebase-config.json
   ```

### 2. Instalar dependencias

```bash
# Instalar todas las dependencias de una vez
npm run install-all

# O instalar manualmente cada servicio:
npm install
cd gateway && npm install
cd ../microservicios/usuarios && npm install
cd ../pagos && npm install
cd ../../frontend && npm install
```

## Levantar el Sistema

### Opción 1: Levantar todo junto (Recomendado)
```bash
npm start
```

Esto iniciará automáticamente:
- ✅ API Gateway en puerto 3000
- ✅ Microservicio Usuarios en puerto 3001
- ✅ Microservicio Pagos en puerto 3002
- ✅ Frontend React en puerto 3003

### Opción 2: Levantar servicios individualmente

**Terminal 1 - API Gateway:**
```bash
cd gateway
npm start
```

**Terminal 2 - Microservicio Usuarios:**
```bash
cd microservicios/usuarios
npm start
```

**Terminal 3 - Microservicio Pagos:**
```bash
cd microservicios/pagos
npm start
```

**Terminal 4 - Frontend:**
```bash
cd frontend
npm start
```

## Verificar que todo funciona

### 1. Verificar servicios
- **API Gateway**: http://localhost:3000
- **Microservicio Usuarios**: http://localhost:3001/health
- **Microservicio Pagos**: http://localhost:3002/health
- **Frontend**: http://localhost:3003

### 2. Probar endpoints
```bash
# Verificar API Gateway
curl http://localhost:3000/health

# Verificar microservicios
curl http://localhost:3001/health
curl http://localhost:3002/health
```

## Estructura de la Base de Datos

### Colección: usuarios
```json
{
  "id": "usuario_id",
  "nombre": "Juan Pérez",
  "email": "juan@email.com",
  "contraseña": "hash_bcrypt",
  "rol": "Alumno",
  "fechaCreacion": "2024-01-15T10:30:00.000Z"
}
```

### Colección: pagos
```json
{
  "id": "pago_id",
  "usuarioId": "usuario_id",
  "concepto": "Matrícula Semestre 2024-1",
  "monto": 1500000,
  "estado": "Pendiente",
  "fechaCreacion": "2024-01-15T10:30:00.000Z",
  "fechaActualizacion": "2024-01-15T10:30:00.000Z"
}
```

## Flujo de la Aplicación

1. **Usuario accede al frontend** (http://localhost:3003)
2. **Se registra o hace login** → Microservicio Usuarios
3. **Crea orden de pago** → API Gateway → Microservicio Pagos
4. **Microservicio Pagos valida usuario** → Microservicio Usuarios
5. **Se guarda pago en Firebase** → Firestore Database

## Comunicación entre Microservicios

```
Frontend (3003) 
    ↓ HTTP
API Gateway (3000)
    ↓ HTTP
Microservicio Usuarios (3001) ←→ Microservicio Pagos (3002)
    ↓
Firebase Firestore
```

## Solución de Problemas

### Error: "Firebase no configurado"
- Verifica que `firebase-config.json` existe en la raíz
- Verifica que las credenciales son correctas

### Error: "Puerto en uso"
- Cambia los puertos en los archivos `.env` o directamente en el código
- O mata los procesos que usan los puertos:
  ```bash
  # Windows
  netstat -ano | findstr :3000
  taskkill /PID <PID> /F
  
  # Linux/Mac
  lsof -ti:3000 | xargs kill -9
  ```

### Error: "CORS"
- Los microservicios ya tienen CORS configurado
- Si persiste, verifica que los puertos son correctos

## Variables de Entorno (Opcional)

Puedes crear archivos `.env` en cada directorio:

**gateway/.env:**
```
PORT=3000
```

**microservicios/usuarios/.env:**
```
PORT=3001
JWT_SECRET=tu-clave-secreta-jwt
```

**microservicios/pagos/.env:**
```
PORT=3002
```

## Producción

Para desplegar en producción:

1. **Configurar variables de entorno**
2. **Usar un proceso manager** como PM2
3. **Configurar HTTPS**
4. **Usar un balanceador de carga**
5. **Configurar monitoreo**

```bash
# Ejemplo con PM2
npm install -g pm2
pm2 start gateway/server.js --name "api-gateway"
pm2 start microservicios/usuarios/server.js --name "usuarios"
pm2 start microservicios/pagos/server.js --name "pagos"
pm2 start frontend/build --name "frontend"
```







