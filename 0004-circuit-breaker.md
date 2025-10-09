# ADR 0004: Circuit Breaker para resiliencia

## Contexto
Dependencias externas pueden fallar y provocar cascadas de errores.

## Decisión
Agregar **Circuit Breaker** en llamadas remotas (timeouts, half-open, fallback).

## Consecuencias
- Positivas: resiliencia, protección ante fallas intermitentes.
- Negativas: tuning de umbrales y telemetría.

## Alternativas
- Retries exponenciales con backoff sin breaker
