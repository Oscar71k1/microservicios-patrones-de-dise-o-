# Microservicio de Usuarios Documentation

## Descripción
Microservicio para gestión de usuarios, autenticación y autorización del sistema universitario.

## Patrones de Diseño Implementados
- **Factory Method Pattern**: DatabaseFactory para conexiones de BD
- **Observer Pattern**: EventManager para notificaciones
- **JWT Authentication**: Tokens de autenticación seguros

## Endpoints

### Autenticación
- `POST /registro` - Registro de nuevo usuario
- `POST /login` - Autenticación de usuario

### Gestión de Usuarios
- `GET /perfil/:id` - Obtener perfil de usuario (requiere token)
- `GET /validar/:id` - Validar existencia de usuario

### Monitoreo
- `GET /health` - Estado del microservicio
- `GET /events/stats` - Estadísticas de eventos
- `GET /events/history` - Historial de eventos

## Base de Datos
- **Firebase Firestore** (producción)
- **In-Memory** (desarrollo/testing)

## Eventos Observer
- `usuario.registrado` - Nuevo usuario registrado
- `usuario.login` - Usuario autenticado

## Observers Configurados
- **EventLogger**: Registra eventos en logs
- **NotificationObserver**: Genera notificaciones
- **AuditObserver**: Registra auditoría

## Configuración
- Puerto: 3001
- JWT Expiration: 24 horas
- Bcrypt Rounds: 10

---
*Documentación generada automáticamente por el pipeline CI/CD*
