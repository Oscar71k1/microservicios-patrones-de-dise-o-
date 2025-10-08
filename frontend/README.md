# Frontend - Sistema de Gestión Universitaria

Frontend minimalista y moderno para el sistema de gestión de inscripciones y pagos universitarios.

## 🎨 Características

- **Diseño Minimalista**: Interfaz limpia y moderna siguiendo principios de diseño UX
- **Responsive**: Adaptable a dispositivos móviles y desktop
- **SPA (Single Page Application)**: Navegación fluida sin recargas de página
- **Autenticación JWT**: Sistema seguro de login y registro
- **Gestión de Pagos**: Creación y visualización de órdenes de pago
- **Dashboard Interactivo**: Panel de control con información del usuario

## 🚀 Tecnologías

- **HTML5**: Estructura semántica
- **CSS3**: Estilos modernos con Flexbox y Grid
- **JavaScript ES6+**: Lógica de aplicación
- **Font Awesome**: Iconografía
- **Google Fonts**: Tipografía Inter

## 📱 Páginas

### 🏠 Inicio
- Página de bienvenida con información del sistema
- Características principales
- Botones de acceso rápido

### 🔐 Autenticación
- **Login**: Inicio de sesión con email y contraseña
- **Registro**: Creación de cuenta con validación
- Roles: Alumno y Administrador

### 📊 Dashboard
- Información personal del usuario
- Pagos recientes
- Acciones rápidas

### 💳 Gestión de Pagos
- Lista de pagos con filtros
- Creación de nuevas órdenes de pago
- Estados: Pendiente, Pagado, Cancelado

## 🎯 Funcionalidades

### Autenticación
- Login con email y contraseña
- Registro de nuevos usuarios
- Persistencia de sesión (localStorage)
- Logout seguro

### Gestión de Usuarios
- Perfil de usuario
- Información personal
- Roles y permisos

### Gestión de Pagos
- Crear órdenes de pago
- Visualizar historial
- Filtrar por estado
- Formato de moneda

### UI/UX
- Notificaciones toast
- Estados de carga
- Modales interactivos
- Navegación intuitiva

## 🛠️ Instalación y Uso

### Requisitos
- Node.js 14+
- NPM o Yarn
- Servicios backend ejecutándose

### Instalación
```bash
# Instalar dependencias
npm install

# Iniciar servidor de desarrollo
npm start

# O usar live-server para desarrollo
npm run dev
```

### URLs
- **Frontend**: http://localhost:3003
- **API Gateway**: http://localhost:3000
- **Usuarios**: http://localhost:3001
- **Pagos**: http://localhost:3002

## 🎨 Diseño

### Paleta de Colores
- **Primario**: #2563eb (Azul)
- **Secundario**: #f1f5f9 (Gris claro)
- **Texto**: #1e293b (Gris oscuro)
- **Éxito**: #059669 (Verde)
- **Error**: #dc2626 (Rojo)
- **Advertencia**: #d97706 (Naranja)

### Tipografía
- **Fuente**: Inter (Google Fonts)
- **Pesos**: 300, 400, 500, 600, 700

### Componentes
- **Botones**: Estilos primario y secundario
- **Formularios**: Campos con validación visual
- **Tarjetas**: Contenedores con sombras sutiles
- **Modales**: Overlays con animaciones
- **Toast**: Notificaciones no intrusivas

## 📱 Responsive Design

### Breakpoints
- **Mobile**: < 480px
- **Tablet**: 480px - 768px
- **Desktop**: > 768px

### Adaptaciones
- Navegación colapsable en móvil
- Grids adaptativos
- Texto escalable
- Botones táctiles

## 🔧 Configuración

### Variables de Entorno
```javascript
const API_BASE_URL = 'http://localhost:3000/api';
```

### Personalización
- Colores en `styles.css`
- Configuración de API en `app.js`
- Iconos de Font Awesome

## 🚀 Despliegue

### Producción
```bash
# Construir para producción
npm run build

# Servir archivos estáticos
npx serve -s . -p 3003
```

### Docker
```dockerfile
FROM nginx:alpine
COPY . /usr/share/nginx/html
EXPOSE 80
```

## 🧪 Testing

### Navegadores Soportados
- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+

### Funcionalidades
- Autenticación completa
- CRUD de pagos
- Navegación SPA
- Responsive design

## 📚 Documentación de API

### Endpoints Utilizados
- `POST /api/usuarios/login` - Login
- `POST /api/usuarios/registro` - Registro
- `GET /api/pagos/usuario/:id` - Pagos del usuario
- `POST /api/pagos/crear` - Crear pago

### Autenticación
- Token JWT en header `Authorization: Bearer <token>`
- Persistencia en localStorage

## 🎯 Próximas Mejoras

- [ ] PWA (Progressive Web App)
- [ ] Notificaciones push
- [ ] Modo oscuro
- [ ] Internacionalización
- [ ] Tests automatizados
- [ ] Optimización de rendimiento

## 📄 Licencia

MIT License - Ver archivo LICENSE para más detalles.




