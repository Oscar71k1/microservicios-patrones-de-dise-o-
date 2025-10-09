# Investigación de Patrones de Diseño

## 1. Patrones de Diseño GoF

### Categorías y Ejemplos

| Categoría      | Patrón             | Propósito                                            | Ventajas                                                                                       | Desventajas                                                                                                  | Ejemplos Industriales                                                 |
|----------------|--------------------|------------------------------------------------------|------------------------------------------------------------------------------------------------|--------------------------------------------------------------------------------------------------------------|-----------------------------------------------------------------------|
| Creacionales   | **Singleton**      | Garantizar una única instancia con acceso global     | - Acceso controlado<br>- Reduce variables globales<br>- Punto de acceso único                  | - Dificulta pruebas unitarias<br>- Viola principio de responsabilidad única<br>- Puede enmascarar mal diseño | Loggers, Conexiones a BD, Configuraciones globales                    |
| Creacionales   | **Factory Method** | Crear objetos delegando la instanciación a subclases | - Elimina acoplamiento<br>- Facilita extensión<br>- Principio de responsabilidad única         | - Introduce muchas subclases<br>- Código más complejo<br>- Overengineering                                   | Frameworks UI, Botones por SO, Plugins                                |
| Creacionales   | **Builder**        | Construir objetos complejos paso a paso              | - Construcción paso a paso<br>- Aísla código de construcción<br>- Múltiples representaciones   | - Código verboso<br>- Requiere Builder separado<br>- Complejidad adicional                                   | Consultas SQL, Documentos XML/JSON, Objetos de configuración          |
| Estructurales  | **Adapter**        | Adaptar interfaces incompatibles para colaborar      | - Permite colaboración<br>- Principio abierto/cerrado<br>- Reutilización de código legacy      | - Complejidad adicional<br>- Sobrecarga de rendimiento<br>- Adapters complejos                               | Integración APIs externas, Wrappers legacy, Conversión de formatos    |
| Estructurales  | **Decorator**      | Añadir responsabilidades dinámicamente a objetos     | - Más flexible que herencia<br>- Responsabilidades dinámicas<br>- Evita explosión de subclases | - Muchos objetos pequeños<br>- Dificulta instanciación<br>- Orden importante                                 | Streams Java I/O, Middleware web, Sistemas de permisos                |
| Estructurales  | **Facade**         | Simplificar interfaz de subsistemas complejos        | - Simplifica interfaz<br>- Desacopla cliente-subsistema<br>- Reduce dependencias               | - Puede convertirse en God Object<br>- Limita funcionalidad<br>- Single point of failure                     | APIs simplificadas, SDKs, Wrappers legacy                             |
| Comportamiento | **Observer**       | Notificar cambios de estado a dependientes           | - Acoplamiento flexible<br>- Soporta broadcast<br>- Fácil extensión                            | - Notificaciones inesperadas<br>- Problemas de rendimiento<br>- Memory leaks potenciales                     | Sistemas de eventos UI, Notificaciones en tiempo real, Microservicios | 
| Comportamiento | **Strategy**       | Intercambiar algoritmos encapsulados                 | - Algoritmos intercambiables en runtime<br>- Elimina condicionales<br>- Principio abierto/cerrado | - Clientes conocen estrategias<br>- Sobrecarga de comunicación<br>- Aumenta objetos                       | Algoritmos de pago, Estrategias de envío, Procesamiento de datos      |
| Comportamiento | **Command**        | Encapsular solicitudes como objetos                  | - Desacopla invocador y receptor<br>- Operaciones reversibles<br>- Composición de comandos        | - Aumenta clases<br>- Complejidad adicional<br>- Overhead de memoria                                      | Sistemas undo/redo, Operaciones en cola, Transacciones                |

---

## 2. Patrones Emergentes

| Patrón                                              | Cuándo aplicarlo                                                                          | Ejemplo                                               |
|-----------------------------------------------------|-------------------------------------------------------------------------------------------|-------------------------------------------------------|
| **MVC (Model-View-Controller)**                     | Aplicaciones web con interacción de usuario. Separar lógica, presentación y control.      | Frameworks como Spring MVC, Ruby on Rails, Django     |
| **DAO (Data Access Object)**                        | Cuando se necesita abstraer el acceso a datos y cambiar fuentes fácilmente.               | Aplicaciones empresariales con BD múltiples           |
| **CQRS (Command Query Responsibility Segregation)** | Cuando lectura y escritura tienen diferentes patrones de uso y se necesita escalabilidad. | E-commerce, sistemas de banca                         |
| **DDD (Domain-Driven Design)**                      | En proyectos complejos con lógica sofisticada, alineando desarrollo con el negocio.       | Sistemas financieros, software de gestión empresarial |
| **MVVM (Model-View-ViewModel)**                     | Interfaces de usuario ricas con binding bidireccional.                                    | Apps móviles y de escritorio (WPF, Xamarin, Angular)  | 

---

## 3. Anti-Patrones

### 1. God Object (Objeto Dios)
- **Descripción:** Una clase que sabe o hace demasiado.  
- **Por qué es dañino:** Viola SRP, dificulta testing y mantenimiento, genera alto acoplamiento.  
- **Cómo evitarlo:** Dividir en clases más pequeñas, aplicar SRP, usar patrones como Facade, refactorizar.

### 2. Spaghetti Code (Código Espagueti)
- **Descripción:** Código desestructurado y difícil de seguir.  
- **Por qué es dañino:** Difícil de mantener, propenso a errores, casi imposible de testear.  
- **Cómo evitarlo:** Aplicar principios SOLID, usar patrones, dividir en métodos pequeños, documentar.  

### 3. Golden Hammer (Martillo de Oro)
- **Descripción:** Usar la misma tecnología/patrón para todo, incluso cuando no aplica.  
- **Por qué es dañino:** Soluciones inapropiadas, sobreingeniería, limita aprendizaje.  
- **Cómo evitarlo:** Evaluar requerimientos, probar diferentes enfoques, mantenerse actualizado.  

---

## 4. CI/CD (Integración y Entrega/Despliegue Continuo)

- **CI (Continuous Integration):** Integrar cambios frecuentemente y ejecutar pruebas automáticamente.  
- **CD (Continuous Delivery):** Software listo para desplegar con un clic.  
- **CD (Continuous Deployment):** Despliegue automático a producción sin intervención.  

### Herramientas más usadas
- GitHub Actions  
- GitLab CI/CD  
- Jenkins  
- CircleCI  

### Ejemplo típico de pipeline
1. Descargar código.  
2. Instalar dependencias.  
3. Revisar estilo (Linter).  
4. Ejecutar pruebas automáticas.  
5. Compilar aplicación.  
6. (Opcional) Desplegar.  

### Beneficios
- Detectar errores rápido.  
- Entregas más rápidas.  
- Mejor colaboración en equipo.  
- Menos errores humanos.  
- Retroalimentación inmediata.  

### Ejemplo sencillo en YAML
```yaml
name: CI Example

on: [push]

jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - name: Descargar código
        uses: actions/checkout@v2

      - name: Instalar dependencias
        run: npm install

      - name: Ejecutar pruebas
        run: npm test
```



# 4 Patrones Elegidos

---

## 🧩 1. Patrón Creacional: **Factory Method**

### ¿Por qué se eligió?
**Problema actual:** Tu sistema maneja múltiples tipos de conexiones (Firebase vs Memoria) según el entorno.  
**Necesidad:** Cada microservicio necesita crear instancias de base de datos de manera consistente.  
**Flexibilidad:** Facilita la extensión para nuevos tipos de almacenamiento (MongoDB, PostgreSQL, etc.).  

### 💡 Justificación técnica
- **Desacoplamiento:** Separa la lógica de creación de conexiones del código de negocio.  
- **Testabilidad:** Permite crear *mocks* fácilmente para testing.  
- **Mantenibilidad:** Cambios en la configuración de DB no afectan el resto del código.  
- **Escalabilidad:** Fácil agregar nuevos tipos de almacenamiento sin modificar microservicios.  

---

## 🧱 2. Patrón Estructural: **API Gateway Pattern**

### ¿Por qué se eligió?
**Problema actual:** Ya tienes implementado un gateway básico que actúa como punto único de entrada.  
**Necesidad:** Mejorar el manejo de autenticación, *rate limiting* y transformación de datos.  
**Comunicación:** Facilita la comunicación entre microservicios y clientes.  

### 💡 Justificación técnica
- **Punto único de entrada:** Centraliza todas las peticiones del sistema.  
- **Seguridad:** Autenticación y autorización centralizadas.  
- **Monitoreo:** *Logging* y métricas en un solo lugar.  
- **Transformación:** Normalización de respuestas entre microservicios.  
- **Rate limiting:** Protección contra abuso de APIs.  

---

## ⚙️ 3. Patrón de Comportamiento: **Observer Pattern**

### ¿Por qué se eligió?
**Problema actual:** El sistema necesita notificar cambios de estado (pagos procesados, usuarios registrados).  
**Necesidad:** Desacoplar los microservicios cuando ocurren eventos importantes.  
**Auditoría:** Facilita la implementación de logs, auditoría y notificaciones.  

### 💡 Justificación técnica
- **Desacoplamiento:** Los microservicios no dependen directamente entre sí.  
- **Escalabilidad:** Fácil agregar nuevos observadores sin modificar el emisor.  
- **Flexibilidad:** Diferentes microservicios pueden reaccionar al mismo evento.  
- **Auditoría:** Trazabilidad completa de eventos del sistema.  
- **Notificaciones:** Sistema de alertas en tiempo real.  

---

## ⚡ 4. Patrón Emergente: **Circuit Breaker Pattern**

### ¿Por qué se eligió?
**Problema actual:** Los microservicios se comunican entre sí (usuarios ↔ pagos).  
**Necesidad:** Proteger el sistema de fallos en cascada.  
**Resiliencia:** Mejorar la disponibilidad del sistema.  

### 💡 Justificación técnica
- **Protección:** Evita que un fallo en un servicio afecte a todo el sistema.  
- **Recuperación:** Recuperación automática cuando el servicio se restaura.  
- **Monitoreo:** Detección temprana de problemas en microservicios.  
- **Fallback:** Respuestas alternativas cuando un servicio no está disponible.  
- **Experiencia:** Mejor experiencia de usuario durante fallos.  

---
