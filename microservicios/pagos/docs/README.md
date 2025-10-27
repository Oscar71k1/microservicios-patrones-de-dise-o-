# Microservicio de Pagos Documentation

## Descripción
Microservicio para gestión de pagos, órdenes y transacciones del sistema universitario.

## Patrones de Diseño Implementados
- **Factory Method Pattern**: DatabaseFactory para conexiones de BD
- **Observer Pattern**: EventManager para notificaciones
- **Circuit Breaker Pattern**: Protección contra fallos del servicio de usuarios

## Endpoints

### Gestión de Pagos
- `POST /crear` - Crear nueva orden de pago
- `GET /orden/:id` - Obtener orden de pago
- `PUT /orden/:id/estado` - Actualizar estado de pago

### Monitoreo
- `GET /health` - Estado del microservicio
- `GET /events/stats` - Estadísticas de eventos
- `GET /events/history` - Historial de eventos
- `GET /circuit-breakers` - Estado de circuit breakers

## Base de Datos
- **Firebase Firestore** (producción)
- **In-Memory** (desarrollo/testing)

## Eventos Observer
- `pago.creado` - Nueva orden de pago creada
- `pago.procesado` - Pago procesado exitosamente
- `pago.cancelado` - Pago cancelado

## Observers Configurados
- **EventLogger**: Registra eventos en logs
- **NotificationObserver**: Genera notificaciones
- **AuditObserver**: Registra auditoría

## Circuit Breaker
- **Servicio usuarios**: Validación de usuarios
- **Failure Threshold**: 3 fallos
- **Timeout**: 5000ms
- **Reset Timeout**: 30000ms

## Configuración
- Puerto: 3002
- Validación automática de usuarios
- Fallback en caso de fallo del servicio de usuarios

---
*Documentación generada automáticamente por el pipeline CI/CD*
