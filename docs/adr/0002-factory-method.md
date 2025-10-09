# ADR 0002: Factory Method para instanciación de repositorios/servicios

## Contexto
La creación de clientes (DB/HTTP/cache) varía por entorno (dev/prod/test).

## Decisión
Usar **Factory Method** para encapsular lógica de creación y permitir mocks en test.

## Consecuencias
- Positivas: testabilidad, flexibilidad por entorno.
- Negativas: más clases y configuración.

## Alternativas
- Inyección de dependencias con contenedor (InversifyJS)
