# ADR 0001: API Gateway como fachada del sistema

## Contexto
Necesitamos un punto de entrada único para múltiples microservicios y políticas comunes (auth, rate-limit, CORS).

## Decisión
Adoptar **API Gateway (Facade)** para enrutar, centralizar cross-cutting concerns y simplificar al cliente.

## Consecuencias
- Positivas: desacoplo del cliente, seguridad centralizada, versionado de APIs.
- Negativas: punto único crítico; requiere observabilidad y escalado.

## Alternativas consideradas
- BFF por plataforma
- Llamadas directas desde frontend a cada microservicio
