# SportsLine API - Guía de Uso

## Descripción General

La API de SportsLine es un sistema completo para la gestión de una tienda deportiva que incluye:

- **Autenticación y Autorización** con JWT y roles
- **Gestión de Usuarios** con cifrado híbrido
- **Gestión de Productos** con control de stock
- **Gestión de Clientes** con validaciones colombianas
- **Gestión de Pedidos** con validación de stock y cifrado
- **Cifrado Híbrido** AES-256-GCM + RSA para datos sensibles

## Autenticación

### 1. Login
```bash
POST /api/auth/login
Content-Type: application/json

{
  "email": "admin@sportsline.com",
  "password": "password123"
}
```

**Respuesta:**
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

### 2. Refresh Token
```bash
POST /api/token/refresh
Content-Type: application/json

{
  "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

### 3. Usar Token en Requests
```bash
GET /api/productos
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

## Gestión de Productos

### 1. Crear Producto
```bash
POST /api/productos
Authorization: Bearer <token>
Content-Type: application/json

{
  "codigo": "DEP-001",
  "nombre": "Balón de Fútbol",
  "descripcion": "Balón oficial de fútbol profesional",
  "precio": 89.99,
  "stock": 50,
  "categoria": "Fútbol"
}
```

### 2. Listar Productos con Filtros
```bash
GET /api/productos?categoria=Fútbol&page=1&limit=10
Authorization: Bearer <token>
```

### 3. Actualizar Stock
```bash
PUT /api/productos/1/stock
Authorization: Bearer <token>
Content-Type: application/json

{
  "cantidad": 10,
  "operacion": "add"
}
```

## Gestión de Clientes

### 1. Crear Cliente
```bash
POST /api/clientes
Authorization: Bearer <token>
Content-Type: application/json

{
  "nombre": "María García",
  "email": "maria@email.com",
  "telefono": "+573001234567",
  "documento": "12345678",
  "tipoDocumento": "cedula",
  "direccion": "Calle 123 #45-67"
}
```

### 2. Buscar Cliente por Documento
```bash
GET /api/clientes/search?documento=12345678
Authorization: Bearer <token>
```

## Gestión de Pedidos

### 1. Crear Pedido
```bash
POST /api/pedidos
Authorization: Bearer <token>
Content-Type: application/json

{
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
}
```

### 2. Consultar Pedidos con Filtros
```bash
GET /api/pedidos?clienteId=1&estado=pendiente&page=1&limit=10
Authorization: Bearer <token>
```

### 3. Actualizar Estado del Pedido
```bash
PUT /api/pedidos/1/estado
Authorization: Bearer <token>
Content-Type: application/json

{
  "estado": "confirmado"
}
```

### 4. Cancelar Pedido
```bash
PUT /api/pedidos/1/cancel
Authorization: Bearer <token>
```

## Cifrado Híbrido

### 1. Cifrar Datos de Pedido
```bash
POST /api/pedidos-encryption/1/encrypt
Authorization: Bearer <token>
```

### 2. Descifrar Datos
```bash
POST /api/pedidos-encryption/decrypt
Authorization: Bearer <token>
Content-Type: application/json

{
  "encryptedData": {
    "pedidoId": 1,
    "encryptedObservaciones": "encrypted_data",
    "encryptedDetalles": "encrypted_data",
    "encryptedMetadata": "encrypted_data"
  }
}
```

### 3. Verificar Integridad
```bash
POST /api/pedidos-encryption/verify-integrity
Authorization: Bearer <token>
Content-Type: application/json

{
  "encryptedData": "encrypted_string"
}
```

## Consultas Avanzadas

### 1. Estadísticas de Pedidos
```bash
GET /api/pedidos/statistics
Authorization: Bearer <token>
```

### 2. Pedidos por Rango de Fechas
```bash
GET /api/pedidos/date-range?fechaInicio=2024-01-01&fechaFin=2024-01-31
Authorization: Bearer <token>
```

### 3. Pedidos Recientes
```bash
GET /api/pedidos/recent?limit=10
Authorization: Bearer <token>
```

### 4. Resumen del Dashboard
```bash
GET /api/pedidos/summary
Authorization: Bearer <token>
```

## Filtros y Paginación

### Parámetros de Paginación
- `page`: Número de página (default: 1)
- `limit`: Elementos por página (default: 10, max: 100)

### Filtros Comunes
- `search`: Búsqueda general
- `activo`: Filtrar por estado activo
- `categoria`: Filtrar por categoría
- `estado`: Filtrar por estado

### Ejemplo de Respuesta Paginada
```json
{
  "success": true,
  "data": {
    "productos": [...],
    "pagination": {
      "page": 1,
      "limit": 10,
      "total": 100,
      "totalPages": 10
    }
  },
  "message": "Productos retrieved successfully"
}
```

## Códigos de Error

### 400 - Bad Request
```json
{
  "success": false,
  "message": "Validation error",
  "errors": [
    {
      "field": "email",
      "message": "Email is required"
    }
  ]
}
```

### 401 - Unauthorized
```json
{
  "success": false,
  "message": "Token JWT inválido o expirado",
  "errors": []
}
```

### 403 - Forbidden
```json
{
  "success": false,
  "message": "No tienes permisos para acceder a este recurso",
  "errors": []
}
```

### 404 - Not Found
```json
{
  "success": false,
  "message": "Resource not found",
  "errors": []
}
```

### 500 - Internal Server Error
```json
{
  "success": false,
  "message": "Internal server error",
  "errors": []
}
```

## Roles y Permisos

### Admin
- Acceso completo a todos los endpoints
- Gestión de usuarios
- Estadísticas y reportes
- Operaciones de cifrado

### Vendedor
- Gestión de productos, clientes y pedidos
- Consultas limitadas
- Sin acceso a estadísticas administrativas

## Validaciones

### Productos
- Código único con formato: `ABC-123` (2-4 letras, guión, 3-6 dígitos)
- Precio entre 0.01 y 999999.99
- Stock entre 0 y 999999

### Clientes
- Teléfono colombiano: `+573001234567`
- Documento según tipo:
  - Cédula: 7-11 dígitos
  - Pasaporte: 6-12 caracteres alfanuméricos
  - NIT: formato `123456789-0`

### Pedidos
- Validación de stock antes de crear
- Estados válidos: `pendiente`, `confirmado`, `enviado`, `entregado`, `cancelado`
- Transiciones de estado controladas

## Seguridad

### Cifrado Híbrido
- **AES-256-GCM**: Para cifrado de datos sensibles
- **RSA**: Para cifrado de claves AES
- **Integridad**: Verificación de integridad de datos cifrados

### Autenticación
- **JWT**: Tokens de acceso con expiración
- **Refresh Tokens**: Renovación automática de tokens
- **Roles**: Control de acceso basado en roles

### Validación
- **Sanitización**: Limpieza de datos de entrada
- **Validación**: Esquemas Joi para validación
- **Logging**: Registro de operaciones de seguridad

## Documentación Interactiva

La documentación completa está disponible en:
- **Swagger UI**: `http://localhost:3000/api-docs`
- **OpenAPI Spec**: Disponible en formato JSON

## Ejemplos de Integración

### JavaScript/Node.js
```javascript
const axios = require('axios');

const api = axios.create({
  baseURL: 'http://localhost:3000/api',
  headers: {
    'Content-Type': 'application/json'
  }
});

// Login
const login = async (email, password) => {
  const response = await api.post('/auth/login', { email, password });
  return response.data.data.accessToken;
};

// Usar token en requests
const getProductos = async (token) => {
  const response = await api.get('/productos', {
    headers: { Authorization: `Bearer ${token}` }
  });
  return response.data;
};
```

### Python
```python
import requests

class SportsLineAPI:
    def __init__(self, base_url='http://localhost:3000/api'):
        self.base_url = base_url
        self.token = None
    
    def login(self, email, password):
        response = requests.post(f'{self.base_url}/auth/login', json={
            'email': email,
            'password': password
        })
        data = response.json()
        self.token = data['data']['accessToken']
        return self.token
    
    def get_productos(self):
        headers = {'Authorization': f'Bearer {self.token}'}
        response = requests.get(f'{self.base_url}/productos', headers=headers)
        return response.json()
```

### cURL
```bash
# Login
TOKEN=$(curl -s -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@sportsline.com","password":"password123"}' \
  | jq -r '.data.accessToken')

# Get productos
curl -H "Authorization: Bearer $TOKEN" \
  http://localhost:3000/api/productos
```
