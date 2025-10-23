# SportsLine API upa

[![Node.js](https://img.shields.io/badge/Node.js-18+-green.svg)](https://nodejs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0+-blue.svg)](https://www.typescriptlang.org/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-13+-blue.svg)](https://www.postgresql.org/)
[![Docker](https://img.shields.io/badge/Docker-Ready-blue.svg)](https://www.docker.com/)
[![Jest](https://img.shields.io/badge/Jest-Testing-red.svg)](https://jestjs.io/)
[![Swagger](https://img.shields.io/badge/Swagger-Documented-green.svg)](https://swagger.io/)

Una API REST completa para la gestión de una tienda deportiva, desarrollada con Node.js, TypeScript y PostgreSQL. Incluye autenticación JWT, cifrado híbrido, validaciones robustas y documentación completa con Swagger.

## 🚀 Características Principales

- **🔐 Autenticación y Autorización**: Sistema JWT con refresh tokens y roles (admin/vendedor)
- **🛡️ Seguridad Avanzada**: Cifrado híbrido AES-256-GCM + RSA para datos sensibles
- **📦 Gestión Completa**: CRUD para usuarios, productos, clientes y pedidos
- **✅ Validaciones Robustas**: Middlewares centralizados con Joi para validación de datos
- **📊 Control de Stock**: Validación automática de inventario y reducción de stock
- **📈 Estadísticas**: Dashboard con métricas de ventas y análisis de pedidos
- **🧪 Testing**: Suite completa de pruebas unitarias con Jest (40%+ cobertura)
- **📚 Documentación**: Swagger UI interactiva con ejemplos y pruebas en vivo
- **🐳 Docker**: Contenedorización completa con Docker Compose
- **🔧 Clean Code**: Principios de código limpio y arquitectura modular

## 📋 Tabla de Contenidos

- [Instalación](#-instalación)
- [Configuración](#-configuración)
- [Uso con Docker](#-uso-con-docker)
- [Desarrollo](#-desarrollo)
- [API Endpoints](#-api-endpoints)
- [Autenticación](#-autenticación)
- [Validaciones](#-validaciones)
- [Testing](#-testing)
- [Documentación](#-documentación)
- [Arquitectura](#-arquitectura)
- [Seguridad](#-seguridad)
- [Contribución](#-contribución)
- [Licencia](#-licencia)

## 🛠️ Instalación

### Prerrequisitos

- Node.js 18+ 
- PostgreSQL 13+
- npm o yarn
- Docker (opcional)

### Instalación Local

1. **Clonar el repositorio**
```bash
git clone https://github.com/jfernand07/Historia-de-usuario.git
cd Historia-de-usuario
```

2. **Instalar dependencias**
```bash
npm install
```

3. **Configurar variables de entorno**
```bash
cp env.example .env
```

4. **Configurar la base de datos**
```bash
# Crear base de datos PostgreSQL
createdb sportsline_db

# Ejecutar migraciones (si las hay)
npm run migrate
```

5. **Poblar datos iniciales**
```bash
npm run seed
```

6. **Compilar TypeScript**
```bash
npm run build
```

7. **Iniciar la aplicación**
```bash
npm start
```

La API estará disponible en `http://localhost:3000`

## ⚙️ Configuración

### Variables de Entorno

Crea un archivo `.env` basado en `env.example`:

```env
# Servidor
NODE_ENV=development
PORT=3000
HOST=localhost

# Base de Datos
DATABASE_URL=postgresql://usuario:password@localhost:5432/sportsline_db

# JWT
JWT_SECRET=tu-jwt-secret-super-seguro
JWT_REFRESH_SECRET=tu-jwt-refresh-secret-super-seguro
JWT_EXPIRES_IN=1h
JWT_REFRESH_EXPIRES_IN=7d

# Cifrado
AES_KEY=tu-clave-aes-32-caracteres
RSA_PUBLIC_KEY=tu-clave-publica-rsa
RSA_PRIVATE_KEY=tu-clave-privada-rsa

# Logging
LOG_LEVEL=info
```

### Configuración de Base de Datos

La aplicación usa PostgreSQL con Sequelize ORM. La configuración se encuentra en `src/config/database.ts`.

**Modelos incluidos:**
- `Usuario`: Gestión de usuarios y autenticación
- `Producto`: Catálogo de productos deportivos
- `Cliente`: Base de datos de clientes
- `Pedido`: Órdenes de compra
- `DetallePedido`: Detalles de productos en pedidos

## 🐳 Uso con Docker

### Desarrollo con Docker Compose

```bash
# Construir y ejecutar en modo desarrollo
npm run docker:dev

# O usar Docker Compose directamente
docker-compose --profile dev up --build
```

### Producción con Docker Compose

```bash
# Construir y ejecutar en modo producción
npm run docker:prod

# O usar Docker Compose directamente
docker-compose up --build
```

### Comandos Docker Útiles

```bash
# Construir imagen
npm run docker:build

# Detener contenedores
npm run docker:down

# Ver logs
docker-compose logs -f app

# Ejecutar comandos en el contenedor
docker-compose exec app npm run seed
```

### Configuración Docker

- **Puerto**: 3000
- **CPU Limit**: 0.5 cores
- **RAM Limit**: 512MB
- **Health Check**: `/health`

## 💻 Desarrollo

### Scripts Disponibles

```bash
# Desarrollo
npm run dev          # Servidor de desarrollo con hot reload
npm run build        # Compilar TypeScript
npm run start        # Iniciar aplicación compilada

# Base de datos
npm run seed         # Poblar datos iniciales

# Testing
npm test            # Ejecutar todas las pruebas
npm run test:watch  # Ejecutar pruebas en modo watch
npm run test:coverage # Ejecutar pruebas con cobertura
npm run test:ci     # Ejecutar pruebas para CI/CD
npm run test:unit   # Ejecutar solo pruebas unitarias

# Docker
npm run docker:build # Construir imagen Docker
npm run docker:dev   # Desarrollo con Docker
npm run docker:prod  # Producción con Docker
npm run docker:down  # Detener contenedores
```

### Estructura del Proyecto

```
src/
├── config/                 # Configuraciones
│   ├── database.ts         # Configuración de base de datos
│   ├── index.ts           # Configuración principal
│   └── swagger.ts         # Configuración de Swagger
├── constants/             # Constantes de la aplicación
│   └── index.ts          # Constantes centralizadas
├── controllers/           # Controladores de la API
│   ├── BaseController.ts # Controlador base
│   ├── AuthController.ts # Autenticación
│   ├── ProductoController.ts # Productos
│   ├── ClienteController.ts  # Clientes
│   └── PedidoController.ts    # Pedidos
├── services/              # Lógica de negocio
│   ├── BaseService.ts    # Servicio base
│   ├── AuthService.ts    # Servicio de autenticación
│   ├── ProductoService.ts # Servicio de productos
│   ├── ClienteService.ts  # Servicio de clientes
│   └── PedidoService.ts   # Servicio de pedidos
├── dao/                   # Data Access Objects
│   ├── BaseDAO.ts        # DAO base
│   ├── UsuarioDAO.ts     # DAO de usuarios
│   ├── ProductoDAO.ts    # DAO de productos
│   ├── ClienteDAO.ts     # DAO de clientes
│   └── PedidoDAO.ts      # DAO de pedidos
├── models/                # Modelos de Sequelize
│   ├── Usuario.ts        # Modelo de usuario
│   ├── Producto.ts       # Modelo de producto
│   ├── Cliente.ts        # Modelo de cliente
│   ├── Pedido.ts         # Modelo de pedido
│   └── DetallePedido.ts  # Modelo de detalle de pedido
├── routes/                # Rutas de la API
│   ├── auth.ts           # Rutas de autenticación
│   ├── usuarios.ts       # Rutas de usuarios
│   ├── productos.ts      # Rutas de productos
│   ├── clientes.ts       # Rutas de clientes
│   ├── pedidos.ts        # Rutas de pedidos
│   └── encryption.ts      # Rutas de cifrado
├── middlewares/           # Middlewares
│   ├── BaseMiddleware.ts # Middleware base
│   ├── AuthMiddleware.ts # Middleware de autenticación
│   ├── ValidationMiddleware.ts # Middleware de validación
│   └── ErrorMiddleware.ts # Middleware de errores
├── dto/                   # Data Transfer Objects
│   ├── AuthDTO.ts        # DTOs de autenticación
│   └── validationSchemas.ts # Esquemas de validación
├── utils/                 # Utilidades
│   ├── helpers.ts        # Utilidades básicas
│   └── EnhancedHelpers.ts # Utilidades mejoradas
├── database/              # Base de datos
│   ├── connection.ts     # Conexión a la base de datos
│   └── seeds/            # Datos iniciales
│       └── index.ts      # Script de seeds
├── tests/                 # Pruebas
│   ├── controllers/      # Pruebas de controladores
│   ├── services/         # Pruebas de servicios
│   ├── middlewares/      # Pruebas de middlewares
│   └── setup.ts         # Configuración de pruebas
└── index.ts              # Punto de entrada de la aplicación
```

### Convenciones de Código

- **TypeScript**: Tipado estricto habilitado
- **ESLint**: Configuración estándar de Node.js
- **Prettier**: Formateo automático de código
- **Conventional Commits**: Convención de commits
- **Clean Code**: Principios de código limpio aplicados

## 🔌 API Endpoints

### Autenticación (`/api/auth`)

| Método | Endpoint | Descripción | Autenticación |
|--------|----------|-------------|---------------|
| POST | `/login` | Iniciar sesión | No |
| POST | `/register` | Registrar usuario | No |
| GET | `/profile` | Obtener perfil | Sí |

### Tokens (`/api/token`)

| Método | Endpoint | Descripción | Autenticación |
|--------|----------|-------------|---------------|
| POST | `/refresh` | Renovar token | Refresh Token |

### Usuarios (`/api/usuarios`)

| Método | Endpoint | Descripción | Autenticación | Rol |
|--------|----------|-------------|---------------|-----|
| GET | `/` | Listar usuarios | Sí | Admin |
| GET | `/:id` | Obtener usuario | Sí | Admin |
| PUT | `/:id` | Actualizar usuario | Sí | Admin |
| DELETE | `/:id` | Eliminar usuario | Sí | Admin |

### Productos (`/api/productos`)

| Método | Endpoint | Descripción | Autenticación | Rol |
|--------|----------|-------------|---------------|-----|
| POST | `/` | Crear producto | Sí | Admin |
| GET | `/` | Listar productos | Sí | Admin/Vendedor |
| GET | `/:id` | Obtener producto | Sí | Admin/Vendedor |
| PUT | `/:id` | Actualizar producto | Sí | Admin |
| DELETE | `/:id` | Eliminar producto | Sí | Admin |
| PUT | `/:id/stock` | Actualizar stock | Sí | Admin |

### Clientes (`/api/clientes`)

| Método | Endpoint | Descripción | Autenticación | Rol |
|--------|----------|-------------|---------------|-----|
| POST | `/` | Crear cliente | Sí | Admin/Vendedor |
| GET | `/` | Listar clientes | Sí | Admin/Vendedor |
| GET | `/:id` | Obtener cliente | Sí | Admin/Vendedor |
| PUT | `/:id` | Actualizar cliente | Sí | Admin/Vendedor |
| DELETE | `/:id` | Eliminar cliente | Sí | Admin |
| GET | `/search` | Buscar cliente | Sí | Admin/Vendedor |

### Pedidos (`/api/pedidos`)

| Método | Endpoint | Descripción | Autenticación | Rol |
|--------|----------|-------------|---------------|-----|
| POST | `/` | Crear pedido | Sí | Admin/Vendedor |
| GET | `/` | Listar pedidos | Sí | Admin/Vendedor |
| GET | `/:id` | Obtener pedido | Sí | Admin/Vendedor |
| PUT | `/:id/estado` | Actualizar estado | Sí | Admin/Vendedor |
| PUT | `/:id/cancel` | Cancelar pedido | Sí | Admin/Vendedor |
| GET | `/statistics` | Estadísticas | Sí | Admin |
| GET | `/by-cliente/:id` | Pedidos por cliente | Sí | Admin/Vendedor |
| GET | `/by-producto/:id` | Pedidos por producto | Sí | Admin/Vendedor |

### Cifrado (`/api/encryption`)

| Método | Endpoint | Descripción | Autenticación | Rol |
|--------|----------|-------------|---------------|-----|
| POST | `/encrypt` | Cifrar datos | Sí | Admin/Vendedor |
| POST | `/decrypt` | Descifrar datos | Sí | Admin/Vendedor |
| POST | `/generate-keys` | Generar claves | Sí | Admin |
| POST | `/verify-integrity` | Verificar integridad | Sí | Admin/Vendedor |

## 🔐 Autenticación

### Flujo de Autenticación

1. **Login**: Enviar credenciales a `/api/auth/login`
2. **Tokens**: Recibir access token y refresh token
3. **Requests**: Incluir access token en header `Authorization: Bearer <token>`
4. **Refresh**: Usar refresh token cuando el access token expire

### Ejemplo de Login

```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@sportsline.com",
    "password": "password123"
  }'
```

### Respuesta de Login

```json
{
  "success": true,
  "data": {
    "user": {
      "id": 1,
      "nombre": "Admin User",
      "email": "admin@sportsline.com",
      "rol": "admin"
    },
    "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "expiresIn": 3600
  },
  "message": "Login successful"
}
```

### Uso del Token

```bash
curl -X GET http://localhost:3000/api/productos \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
```

### Renovar Token

```bash
curl -X POST http://localhost:3000/api/token/refresh \
  -H "Content-Type: application/json" \
  -d '{
    "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }'
```

## ✅ Validaciones

### Productos

- **Código**: Formato `ABC-123` (2-4 letras, guión, 3-6 dígitos)
- **Nombre**: 2-100 caracteres
- **Descripción**: Máximo 500 caracteres
- **Precio**: 0.01 - 999999.99
- **Stock**: 0 - 999999
- **Categoría**: 2-50 caracteres

### Clientes

- **Nombre**: 2-100 caracteres
- **Email**: Formato de email válido
- **Teléfono**: Formato colombiano `+573001234567`
- **Documento**: Según tipo:
  - Cédula: 7-11 dígitos
  - Pasaporte: 6-12 caracteres alfanuméricos
  - NIT: Formato `123456789-0`
- **Dirección**: Máximo 200 caracteres

### Pedidos

- **Cliente**: Debe existir y estar activo
- **Productos**: Array con al menos un producto
- **Cantidad**: Mínimo 1 por producto
- **Stock**: Validación automática de disponibilidad
- **Estados**: Transiciones válidas entre estados

### Usuarios

- **Nombre**: 2-100 caracteres
- **Email**: Formato de email válido y único
- **Password**: 6-128 caracteres
- **Rol**: `admin` o `vendedor`

## 🧪 Testing

### Ejecutar Pruebas

```bash
# Todas las pruebas
npm test

# Pruebas en modo watch
npm run test:watch

# Pruebas con cobertura
npm run test:coverage

# Pruebas para CI/CD
npm run test:ci

# Solo pruebas unitarias
npm run test:unit
```

### Cobertura de Pruebas

- **Cobertura mínima**: 40%
- **Controladores**: Pruebas completas de todos los endpoints
- **Servicios**: Pruebas de lógica de negocio
- **Middlewares**: Pruebas de autenticación y validación
- **DAOs**: Pruebas de operaciones de base de datos

### Estructura de Pruebas

```
src/tests/
├── controllers/          # Pruebas de controladores
│   ├── AuthController.test.ts
│   ├── ProductoController.test.ts
│   └── ...
├── services/             # Pruebas de servicios
│   ├── AuthService.test.ts
│   ├── ProductoService.test.ts
│   └── ...
├── middlewares/          # Pruebas de middlewares
│   ├── AuthMiddleware.test.ts
│   └── ...
├── setup.ts             # Configuración de pruebas
├── globalSetup.ts       # Setup global
└── globalTeardown.ts    # Teardown global
```

### Ejemplo de Prueba

```typescript
describe('AuthController', () => {
  it('should login successfully with valid credentials', async () => {
    const loginData = {
      email: 'admin@sportsline.com',
      password: 'password123'
    };

    const response = await request(app)
      .post('/api/auth/login')
      .send(loginData);

    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);
    expect(response.body.data.user).toBeDefined();
    expect(response.body.data.accessToken).toBeDefined();
  });
});
```

## 📚 Documentación

### Swagger UI

La documentación interactiva está disponible en:
- **Desarrollo**: `http://localhost:3000/api-docs`
- **Producción**: `https://api.sportsline.com/api-docs`

### Características de la Documentación

- **Interfaz interactiva**: Prueba endpoints directamente
- **Autenticación integrada**: Soporte para JWT Bearer tokens
- **Ejemplos reales**: Request/response examples para todos los endpoints
- **Validaciones**: Esquemas de validación documentados
- **Códigos de estado**: Documentación completa de respuestas HTTP

### Especificación OpenAPI

La especificación OpenAPI está disponible en:
- **JSON**: `http://localhost:3000/api-docs/swagger.json`
- **YAML**: `http://localhost:3000/api-docs/swagger.yaml`

### Documentación Adicional

- **API Usage Guide**: `API_USAGE_GUIDE.md`
- **Testing Guide**: `TESTING_GUIDE.md`
- **Clean Code Implementation**: `CLEAN_CODE_IMPLEMENTATION.md`
- **Swagger Documentation**: `SWAGGER_DOCUMENTATION.md`

## 🏗️ Arquitectura

### Patrón de Arquitectura

La aplicación sigue una arquitectura de capas con separación clara de responsabilidades:

```
┌─────────────────┐
│   Controllers   │ ← Capa de presentación
├─────────────────┤
│    Services     │ ← Lógica de negocio
├─────────────────┤
│      DAOs       │ ← Acceso a datos
├─────────────────┤
│     Models      │ ← Modelos de datos
├─────────────────┤
│   Database      │ ← Base de datos
└─────────────────┘
```

### Principios de Diseño

- **Single Responsibility**: Cada clase tiene una responsabilidad específica
- **Dependency Injection**: Inyección de dependencias para testing
- **Interface Segregation**: Interfaces específicas para cada funcionalidad
- **Open/Closed**: Abierto para extensión, cerrado para modificación
- **DRY**: Don't Repeat Yourself - Eliminación de código duplicado

### Patrones Implementados

- **Repository Pattern**: DAOs para acceso a datos
- **Service Layer**: Servicios para lógica de negocio
- **DTO Pattern**: Data Transfer Objects para validación
- **Middleware Pattern**: Middlewares para funcionalidades transversales
- **Factory Pattern**: Factories para creación de objetos complejos

## 🔒 Seguridad

### Autenticación JWT

- **Algoritmo**: HS256
- **Access Token**: Expira en 1 hora
- **Refresh Token**: Expira en 7 días
- **Seguridad**: Tokens firmados con secretos seguros

### Cifrado Híbrido

- **AES-256-GCM**: Para cifrado de datos sensibles
- **RSA**: Para cifrado de claves AES
- **Integridad**: Verificación de integridad de datos cifrados
- **Auditoría**: Logs de operaciones de cifrado

### Validaciones de Seguridad

- **Sanitización**: Limpieza de datos de entrada
- **Validación**: Esquemas Joi para validación robusta
- **Rate Limiting**: Protección contra ataques de fuerza bruta
- **CORS**: Configuración de Cross-Origin Resource Sharing
- **Helmet**: Headers de seguridad HTTP

### Roles y Permisos

- **Admin**: Acceso completo a todos los endpoints
- **Vendedor**: Acceso limitado a operaciones de venta
- **Middleware**: Verificación automática de roles y permisos

## 🚀 Despliegue

### Variables de Entorno de Producción

```env
NODE_ENV=production
PORT=3000
DATABASE_URL=postgresql://user:pass@host:port/db
JWT_SECRET=secret-super-seguro-produccion
JWT_REFRESH_SECRET=refresh-secret-super-seguro-produccion
```

### Docker en Producción

```bash
# Construir imagen de producción
docker build -t sportsline-api:latest .

# Ejecutar contenedor
docker run -d \
  --name sportsline-api \
  -p 3000:3000 \
  -e NODE_ENV=production \
  -e DATABASE_URL=postgresql://... \
  sportsline-api:latest
```

### Docker Compose para Producción

```bash
# Ejecutar con Docker Compose
docker-compose -f docker-compose.prod.yml up -d
```
