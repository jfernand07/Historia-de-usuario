# SportsLine API - Swagger Documentation

## Descripción General

La documentación de Swagger para la API de SportsLine proporciona una interfaz interactiva completa que permite a los desarrolladores explorar, probar y entender todos los endpoints disponibles. La documentación está diseñada siguiendo las mejores prácticas de OpenAPI 3.0.

## Características de la Documentación

### 1. Interfaz Interactiva
- **Swagger UI**: Interfaz web interactiva disponible en `/api-docs`
- **Pruebas en vivo**: Posibilidad de probar endpoints directamente desde la documentación
- **Autenticación integrada**: Soporte para JWT Bearer tokens
- **Ejemplos reales**: Todos los endpoints incluyen ejemplos de request/response

### 2. Esquemas Completos
- **Esquemas de datos**: Definiciones completas de todos los modelos
- **Validaciones**: Reglas de validación para todos los campos
- **Tipos de datos**: Especificación precisa de tipos y formatos
- **Ejemplos**: Ejemplos realistas para cada esquema

### 3. Respuestas Estandarizadas
- **Códigos de estado**: Documentación completa de códigos HTTP
- **Formatos de respuesta**: Estructura consistente de respuestas
- **Manejo de errores**: Documentación de todos los tipos de error
- **Paginación**: Especificación de respuestas paginadas

## Estructura de la Documentación

### 1. Información General
```yaml
info:
  title: SportsLine API
  version: 1.0.0
  description: |
    # SportsLine API Documentation
    
    Esta API proporciona funcionalidades completas para la gestión de una tienda deportiva, incluyendo:
    
    ## Características Principales
    
    - **Autenticación y Autorización**: Sistema JWT con refresh tokens y roles
    - **Gestión de Usuarios**: CRUD completo con validaciones y cifrado híbrido
    - **Gestión de Productos**: CRUD con validación de códigos únicos y control de stock
    - **Gestión de Clientes**: CRUD con validaciones de documentos colombianos
    - **Gestión de Pedidos**: Sistema completo con validación de stock y cifrado híbrido
    - **Cifrado Híbrido**: AES-256-GCM + RSA para operaciones sensibles
    - **Validaciones**: Middlewares centralizados con Joi
    - **Documentación**: Swagger completo con ejemplos
```

### 2. Servidores
```yaml
servers:
  - url: http://localhost:3000
    description: Development server
  - url: https://api.sportsline.com
    description: Production server
```

### 3. Autenticación
```yaml
securitySchemes:
  bearerAuth:
    type: http
    scheme: bearer
    bearerFormat: JWT
    description: JWT token obtenido del endpoint de login
```

## Endpoints Documentados

### 1. Autenticación (`/api/auth`)
- **POST /login**: Inicio de sesión
- **POST /register**: Registro de usuario
- **GET /profile**: Obtener perfil del usuario

### 2. Tokens (`/api/token`)
- **POST /refresh**: Renovar token de acceso

### 3. Usuarios (`/api/usuarios`)
- **GET /**: Listar usuarios (Admin)
- **GET /:id**: Obtener usuario por ID
- **PUT /:id**: Actualizar usuario
- **DELETE /:id**: Eliminar usuario

### 4. Productos (`/api/productos`)
- **POST /**: Crear producto (Admin)
- **GET /**: Listar productos con filtros
- **GET /:id**: Obtener producto por ID
- **PUT /:id**: Actualizar producto (Admin)
- **DELETE /:id**: Eliminar producto (Admin)
- **PUT /:id/stock**: Actualizar stock (Admin)

### 5. Clientes (`/api/clientes`)
- **POST /**: Crear cliente
- **GET /**: Listar clientes con filtros
- **GET /:id**: Obtener cliente por ID
- **PUT /:id**: Actualizar cliente
- **DELETE /:id**: Eliminar cliente
- **GET /search**: Buscar cliente por documento

### 6. Pedidos (`/api/pedidos`)
- **POST /**: Crear pedido
- **GET /**: Listar pedidos con filtros
- **GET /:id**: Obtener pedido por ID
- **PUT /:id/estado**: Actualizar estado del pedido
- **PUT /:id/cancel**: Cancelar pedido
- **GET /statistics**: Obtener estadísticas de pedidos
- **GET /by-cliente/:clienteId**: Pedidos por cliente
- **GET /by-producto/:productoId**: Pedidos por producto

### 7. Cifrado de Pedidos (`/api/pedidos-encryption`)
- **POST /:id/encrypt**: Cifrar datos del pedido
- **POST /decrypt**: Descifrar datos del pedido
- **POST /creation/encrypt**: Cifrar datos de creación
- **POST /creation/decrypt**: Descifrar datos de creación
- **POST /update/encrypt**: Cifrar datos de actualización
- **POST /update/decrypt**: Descifrar datos de actualización
- **POST /search/encrypt**: Cifrar filtros de búsqueda
- **POST /search/decrypt**: Descifrar filtros de búsqueda
- **POST /statistics/encrypt**: Cifrar estadísticas
- **POST /statistics/decrypt**: Descifrar estadísticas
- **POST /verify-integrity**: Verificar integridad de cifrado
- **POST /audit-log**: Generar log de auditoría

### 8. Cifrado General (`/api/encryption`)
- **POST /encrypt**: Cifrar datos
- **POST /decrypt**: Descifrar datos
- **POST /generate-keys**: Generar claves de cifrado
- **POST /verify-integrity**: Verificar integridad

## Esquemas de Datos

### 1. Usuario
```yaml
Usuario:
  type: object
  properties:
    id:
      type: number
      example: 1
    nombre:
      type: string
      example: "Admin User"
    email:
      type: string
      format: email
      example: "admin@sportsline.com"
    rol:
      type: string
      enum: ["admin", "vendedor"]
      example: "admin"
    activo:
      type: boolean
      example: true
    createdAt:
      type: string
      format: date-time
    updatedAt:
      type: string
      format: date-time
```

### 2. Producto
```yaml
Producto:
  type: object
  properties:
    id:
      type: number
      example: 1
    codigo:
      type: string
      pattern: "^[A-Z]{2,4}-[0-9]{3,6}$"
      example: "DEP-001"
    nombre:
      type: string
      example: "Balón de Fútbol"
    descripcion:
      type: string
      example: "Balón oficial de fútbol profesional"
    precio:
      type: number
      format: decimal
      example: 89.99
    stock:
      type: number
      example: 50
    categoria:
      type: string
      example: "Fútbol"
    activo:
      type: boolean
      example: true
```

### 3. Cliente
```yaml
Cliente:
  type: object
  properties:
    id:
      type: number
      example: 1
    nombre:
      type: string
      example: "María García"
    email:
      type: string
      format: email
      example: "maria@email.com"
    telefono:
      type: string
      pattern: "^(\+57|57)?[1-9]\\d{9}$"
      example: "+573001234567"
    documento:
      type: string
      example: "12345678"
    tipoDocumento:
      type: string
      enum: ["cedula", "pasaporte", "nit"]
      example: "cedula"
    direccion:
      type: string
      example: "Calle 123 #45-67"
    activo:
      type: boolean
      example: true
```

### 4. Pedido
```yaml
Pedido:
  type: object
  properties:
    id:
      type: number
      example: 1
    clienteId:
      type: number
      example: 1
    usuarioId:
      type: number
      example: 1
    fecha:
      type: string
      format: date-time
    total:
      type: number
      format: decimal
      example: 299.97
    estado:
      type: string
      enum: ["pendiente", "confirmado", "enviado", "entregado", "cancelado"]
      example: "pendiente"
    observaciones:
      type: string
      example: "Pedido urgente"
    detalles:
      type: array
      items:
        $ref: "#/components/schemas/DetallePedido"
```

## Parámetros Comunes

### 1. Paginación
```yaml
parameters:
  PageParam:
    name: page
    in: query
    description: Número de página
    required: false
    schema:
      type: integer
      minimum: 1
      default: 1
  LimitParam:
    name: limit
    in: query
    description: Número de elementos por página
    required: false
    schema:
      type: integer
      minimum: 1
      maximum: 100
      default: 10
```

### 2. Filtros
```yaml
parameters:
  SearchParam:
    name: search
    in: query
    description: Término de búsqueda
    required: false
    schema:
      type: string
      minLength: 1
      maxLength: 100
  EstadoParam:
    name: estado
    in: query
    description: Estado del recurso
    required: false
    schema:
      type: string
      enum: ["pendiente", "confirmado", "enviado", "entregado", "cancelado"]
  CategoriaParam:
    name: categoria
    in: query
    description: Categoría del producto
    required: false
    schema:
      type: string
      minLength: 2
      maxLength: 50
```

## Respuestas Estandarizadas

### 1. Respuesta Exitosa
```yaml
SuccessResponse:
  type: object
  properties:
    success:
      type: boolean
      example: true
    data:
      type: object
      description: Response data
    message:
      type: string
      example: "Operation completed successfully"
    timestamp:
      type: string
      format: date-time
```

### 2. Respuesta Paginada
```yaml
PaginationResponse:
  type: object
  properties:
    success:
      type: boolean
      example: true
    data:
      type: object
      properties:
        items:
          type: array
          items:
            type: object
        pagination:
          type: object
          properties:
            page:
              type: number
              example: 1
            limit:
              type: number
              example: 10
            total:
              type: number
              example: 100
            totalPages:
              type: number
              example: 10
    message:
      type: string
      example: "Data retrieved successfully"
```

### 3. Respuesta de Error
```yaml
ErrorResponse:
  type: object
  properties:
    success:
      type: boolean
      example: false
    message:
      type: string
      example: "Error message"
    errors:
      type: array
      items:
        type: object
        properties:
          field:
            type: string
            example: "email"
          message:
            type: string
            example: "Email is required"
    timestamp:
      type: string
      format: date-time
```

## Códigos de Estado HTTP

### 1. Éxito
- **200 OK**: Operación exitosa
- **201 Created**: Recurso creado exitosamente
- **204 No Content**: Operación exitosa sin contenido

### 2. Error del Cliente
- **400 Bad Request**: Solicitud malformada
- **401 Unauthorized**: No autorizado
- **403 Forbidden**: Prohibido
- **404 Not Found**: Recurso no encontrado
- **409 Conflict**: Conflicto de recursos
- **422 Unprocessable Entity**: Error de validación

### 3. Error del Servidor
- **500 Internal Server Error**: Error interno del servidor
- **503 Service Unavailable**: Servicio no disponible

## Ejemplos de Uso

### 1. Autenticación
```bash
# Login
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@sportsline.com",
    "password": "password123"
  }'

# Response
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

### 2. Crear Producto
```bash
# Create Product
curl -X POST http://localhost:3000/api/productos \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "codigo": "DEP-001",
    "nombre": "Balón de Fútbol",
    "descripcion": "Balón oficial de fútbol profesional",
    "precio": 89.99,
    "stock": 50,
    "categoria": "Fútbol"
  }'

# Response
{
  "success": true,
  "data": {
    "id": 1,
    "codigo": "DEP-001",
    "nombre": "Balón de Fútbol",
    "descripcion": "Balón oficial de fútbol profesional",
    "precio": 89.99,
    "stock": 50,
    "categoria": "Fútbol",
    "activo": true,
    "createdAt": "2024-01-15T10:30:00Z",
    "updatedAt": "2024-01-15T10:30:00Z"
  },
  "message": "Producto created successfully"
}
```

### 3. Crear Pedido
```bash
# Create Order
curl -X POST http://localhost:3000/api/pedidos \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "clienteId": 1,
    "productos": [
      {
        "productoId": 1,
        "cantidad": 2
      },
      {
        "productoId": 2,
        "cantidad": 1
      }
    ],
    "observaciones": "Pedido urgente"
  }'

# Response
{
  "success": true,
  "data": {
    "id": 1,
    "clienteId": 1,
    "usuarioId": 1,
    "total": 299.98,
    "estado": "pendiente",
    "observaciones": "Pedido urgente",
    "fecha": "2024-01-15T10:30:00Z",
    "detalles": [
      {
        "productoId": 1,
        "cantidad": 2,
        "precioUnitario": 89.99,
        "subtotal": 179.98
      },
      {
        "productoId": 2,
        "cantidad": 1,
        "precioUnitario": 120.00,
        "subtotal": 120.00
      }
    ]
  },
  "message": "Pedido created successfully"
}
```

## Validaciones Documentadas

### 1. Productos
- **Código**: Formato `ABC-123` (2-4 letras, guión, 3-6 dígitos)
- **Precio**: Entre 0.01 y 999999.99
- **Stock**: Entre 0 y 999999
- **Nombre**: Entre 2 y 100 caracteres
- **Descripción**: Máximo 500 caracteres

### 2. Clientes
- **Teléfono**: Formato colombiano `+573001234567`
- **Email**: Formato de email válido
- **Documento**: Según tipo:
  - Cédula: 7-11 dígitos
  - Pasaporte: 6-12 caracteres alfanuméricos
  - NIT: Formato `123456789-0`

### 3. Pedidos
- **Productos**: Array con al menos un producto
- **Cantidad**: Mínimo 1 por producto
- **Stock**: Validación automática de disponibilidad
- **Estados**: Transiciones válidas entre estados

## Seguridad Documentada

### 1. Autenticación JWT
- **Access Token**: Expira en 1 hora
- **Refresh Token**: Expira en 7 días
- **Algoritmo**: HS256
- **Uso**: Bearer token en header Authorization

### 2. Roles y Permisos
- **Admin**: Acceso completo a todos los endpoints
- **Vendedor**: Acceso limitado a operaciones de venta
- **Middleware**: Verificación automática de roles

### 3. Cifrado Híbrido
- **AES-256-GCM**: Para cifrado de datos sensibles
- **RSA**: Para cifrado de claves AES
- **Integridad**: Verificación de integridad de datos

## Mejores Prácticas

### 1. Uso de la Documentación
- **Explorar**: Usar Swagger UI para explorar endpoints
- **Probar**: Probar endpoints directamente desde la interfaz
- **Validar**: Verificar esquemas antes de implementar
- **Mantener**: Actualizar documentación con cada cambio

### 2. Desarrollo
- **Consistencia**: Seguir los esquemas documentados
- **Validación**: Implementar validaciones según la documentación
- **Errores**: Usar códigos de estado estándar
- **Respuestas**: Mantener formato consistente

### 3. Testing
- **Ejemplos**: Usar ejemplos de la documentación para tests
- **Validación**: Probar validaciones documentadas
- **Errores**: Verificar manejo de errores
- **Autenticación**: Probar flujos de autenticación

## Acceso a la Documentación

### 1. Interfaz Web
- **URL**: `http://localhost:3000/api-docs`
- **Interfaz**: Swagger UI interactiva
- **Funcionalidades**: Pruebas en vivo, autenticación, ejemplos

### 2. Especificación OpenAPI
- **URL**: `http://localhost:3000/api-docs/swagger.json`
- **Formato**: JSON
- **Uso**: Importar en herramientas de desarrollo

### 3. Generación de Código
- **Clientes**: Generar clientes SDK desde la especificación
- **Mocks**: Crear mocks para testing
- **Validación**: Validar requests/responses

## Mantenimiento

### 1. Actualizaciones
- **Sincronización**: Mantener documentación sincronizada con código
- **Versionado**: Usar versionado semántico
- **Changelog**: Documentar cambios en cada versión

### 2. Mejoras Continuas
- **Feedback**: Recopilar feedback de usuarios
- **Ejemplos**: Mejorar ejemplos con casos reales
- **Validaciones**: Refinar validaciones según uso
- **Performance**: Optimizar documentación para mejor rendimiento

## Conclusión

La documentación de Swagger para SportsLine API proporciona:

- **Interfaz interactiva** completa para explorar y probar endpoints
- **Esquemas detallados** con validaciones y ejemplos
- **Respuestas estandarizadas** con códigos de estado claros
- **Seguridad documentada** con autenticación y roles
- **Ejemplos prácticos** para implementación y testing
- **Mejores prácticas** para desarrollo y mantenimiento

Esta documentación facilita el desarrollo, testing y mantenimiento de la API, garantizando una experiencia de desarrollo consistente y eficiente.
