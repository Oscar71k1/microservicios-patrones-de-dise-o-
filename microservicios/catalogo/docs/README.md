# Microservicio de Catálogo Documentation

## Descripción
Microservicio para gestión del catálogo académico-financiero del sistema universitario.

## Patrones de Diseño Implementados
- **Factory Method Pattern**: DatabaseFactory para conexiones de BD
- **Observer Pattern**: EventManager para notificaciones

## Endpoints

### Gestión de Conceptos
- `GET /conceptos` - Obtener todos los conceptos
- `POST /conceptos` - Crear nuevo concepto
- `GET /conceptos/:id` - Obtener concepto específico
- `POST /conceptos/alumno` - Obtener conceptos de un alumno

### Monitoreo
- `GET /health` - Estado del microservicio
- `GET /events/stats` - Estadísticas de eventos
- `GET /events/history` - Historial de eventos

## Base de Datos
- **Firebase Firestore** (producción)
- **In-Memory** (desarrollo/testing)

## Eventos Observer
- `concepto.creado` - Nuevo concepto creado
- `concepto.actualizado` - Concepto actualizado

## Observers Configurados
- **EventLogger**: Registra eventos en logs
- **NotificationObserver**: Genera notificaciones
- **AuditObserver**: Registra auditoría

## Tipos de Conceptos
- **Académicos**: Materias, cursos, certificaciones
- **Financieros**: Colegiaturas, servicios, materiales

## Configuración
- Puerto: 3004
- Gestión de conceptos activos/inactivos
- Filtrado por tipo y estado

---
*Documentación generada automáticamente por el pipeline CI/CD*
