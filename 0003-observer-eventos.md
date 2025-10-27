# ADR 0003: Observer para eventos de dominio

## Contexto
Necesitamos reaccionar a eventos (p. ej., 'usuarioCreado') en varios servicios.

## Decisión
Aplicar **Observer (Publish/Subscribe)** para notificar suscriptores desacoplados.

## Consecuencias
- Positivas: extensibilidad sin modificar emisores.
- Negativas: depuración más compleja; requiere tracing.

## Alternativas
- Cola de mensajes (RabbitMQ/Kafka) con Event-driven Architecture
