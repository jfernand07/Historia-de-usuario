# SportsLine API - Testing Guide

## Descripción General

Este proyecto incluye un conjunto completo de pruebas unitarias implementadas con Jest para garantizar la calidad y confiabilidad del código. Las pruebas cubren controladores, servicios, middlewares y DAOs con una cobertura mínima del 40%.

## Estructura de Pruebas

```
src/tests/
├── controllers/
│   ├── AuthController.test.ts
│   ├── ProductoController.test.ts
│   ├── ClienteController.test.ts
│   └── PedidoController.test.ts
├── services/
│   ├── AuthService.test.ts
│   ├── ProductoService.test.ts
│   ├── ClienteService.test.ts
│   └── PedidoService.test.ts
├── middlewares/
│   ├── AuthMiddleware.test.ts
│   ├── ValidationMiddleware.test.ts
│   └── ErrorMiddleware.test.ts
├── dao/
│   ├── UsuarioDAO.test.ts
│   ├── ProductoDAO.test.ts
│   ├── ClienteDAO.test.ts
│   └── PedidoDAO.test.ts
├── setup.ts
├── globalSetup.ts
├── globalTeardown.ts
└── types/
    └── jest.d.ts
```

## Configuración de Jest

### Archivo de Configuración Principal
- `jest.config.ts`: Configuración completa de Jest con TypeScript
- Cobertura mínima del 40% en branches, functions, lines y statements
- Configuración para entorno Node.js
- Soporte para ES modules

### Archivos de Setup
- `setup.ts`: Configuración global para cada test
- `globalSetup.ts`: Configuración inicial antes de todos los tests
- `globalTeardown.ts`: Limpieza después de todos los tests

## Scripts de Testing

### Scripts Disponibles
```bash
# Ejecutar todas las pruebas
npm test

# Ejecutar pruebas en modo watch
npm run test:watch

# Ejecutar pruebas con cobertura
npm run test:coverage

# Ejecutar pruebas para CI/CD
npm run test:ci

# Ejecutar solo pruebas unitarias
npm run test:unit

# Ejecutar solo pruebas de integración
npm run test:integration

# Ejecutar pruebas en modo debug
npm run test:debug

# Limpiar caché de Jest
npm run test:clear
```

## Tipos de Pruebas

### 1. Pruebas de Controladores
- **AuthController**: Login, registro, perfil de usuario
- **ProductoController**: CRUD de productos, actualización de stock
- **ClienteController**: CRUD de clientes, búsquedas
- **PedidoController**: CRUD de pedidos, cancelación, estadísticas

### 2. Pruebas de Servicios
- **AuthService**: Validación de credenciales, generación de tokens
- **ProductoService**: Lógica de negocio de productos
- **ClienteService**: Lógica de negocio de clientes
- **PedidoService**: Lógica de negocio de pedidos, validación de stock

### 3. Pruebas de Middlewares
- **AuthMiddleware**: Verificación de tokens, control de roles
- **ValidationMiddleware**: Validación de entrada de datos
- **ErrorMiddleware**: Manejo de errores

### 4. Pruebas de DAOs
- **UsuarioDAO**: Operaciones de base de datos de usuarios
- **ProductoDAO**: Operaciones de base de datos de productos
- **ClienteDAO**: Operaciones de base de datos de clientes
- **PedidoDAO**: Operaciones de base de datos de pedidos

## Mocking y Stubs

### Dependencias Mockeadas
- **Sequelize**: ORM para base de datos
- **bcryptjs**: Hashing de contraseñas
- **jsonwebtoken**: Generación y verificación de JWT
- **crypto**: Funciones de cifrado
- **express**: Framework web
- **helmet**: Seguridad HTTP
- **cors**: Configuración CORS

### Utilidades de Testing
```typescript
// Crear request mock
const mockRequest = testUtils.createMockRequest({
  body: { email: 'test@example.com' },
  user: { id: 1, rol: 'admin' }
});

// Crear response mock
const mockResponse = testUtils.createMockResponse();

// Crear next function mock
const mockNext = testUtils.createMockNext();

// Crear entidades mock
const mockUser = testUtils.createMockUser();
const mockProducto = testUtils.createMockProducto();
const mockCliente = testUtils.createMockCliente();
const mockPedido = testUtils.createMockPedido();
```

## Cobertura de Pruebas

### Métricas de Cobertura
- **Branches**: 40% mínimo
- **Functions**: 40% mínimo
- **Lines**: 40% mínimo
- **Statements**: 40% mínimo

### Archivos Excluidos de Cobertura
- Archivos de configuración (`src/config/`)
- Archivos de pruebas (`src/tests/`)
- Archivo principal (`src/index.ts`)
- Archivos de tipos (`.d.ts`)

### Reportes de Cobertura
- **HTML**: `coverage/lcov-report/index.html`
- **LCOV**: `coverage/lcov.info`
- **Texto**: Consola durante la ejecución
- **JUnit**: `coverage/junit.xml`

## Casos de Prueba Principales

### Autenticación
```typescript
describe('AuthController', () => {
  it('should login successfully with valid credentials');
  it('should return error for invalid credentials');
  it('should return error for inactive user');
  it('should handle service errors');
});
```

### Productos
```typescript
describe('ProductoController', () => {
  it('should create producto successfully');
  it('should return error for duplicate code');
  it('should return error for unauthorized user');
  it('should handle service errors');
});
```

### Pedidos
```typescript
describe('PedidoService', () => {
  it('should create pedido successfully with stock validation');
  it('should throw error for insufficient stock');
  it('should throw error for non-existent producto');
  it('should cancel pedido and restore stock');
});
```

## Mejores Prácticas

### 1. Estructura de Pruebas
- Usar `describe` para agrupar pruebas relacionadas
- Usar `it` para casos de prueba específicos
- Usar `beforeEach` y `afterEach` para setup y cleanup

### 2. Naming Conventions
- Describir el comportamiento esperado
- Usar formato: "should [expected behavior] when [condition]"
- Ser específico y claro

### 3. Mocking
- Mockear todas las dependencias externas
- Usar `jest.clearAllMocks()` entre pruebas
- Verificar que los mocks fueron llamados correctamente

### 4. Assertions
- Usar assertions específicas y descriptivas
- Verificar tanto el resultado como los efectos secundarios
- Incluir mensajes de error claros

### 5. Test Data
- Usar datos de prueba realistas
- Crear factories para entidades complejas
- Mantener datos de prueba consistentes

## Debugging de Pruebas

### Herramientas de Debug
```bash
# Ejecutar una prueba específica
npm test -- --testNamePattern="should login successfully"

# Ejecutar pruebas de un archivo específico
npm test -- AuthController.test.ts

# Ejecutar en modo debug
npm run test:debug

# Ver cobertura detallada
npm run test:coverage
```

### Logging en Pruebas
```typescript
// Habilitar logging detallado
process.env.LOG_LEVEL = 'debug';

// Usar console.log para debugging
console.log('Debug info:', mockRequest);
```

## Integración Continua

### GitHub Actions
```yaml
name: Tests
on: [push, pull_request]
jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - uses: actions/setup-node@v2
        with:
          node-version: '18'
      - run: npm ci
      - run: npm run test:ci
```

### Pre-commit Hooks
```json
{
  "husky": {
    "hooks": {
      "pre-commit": "npm run test:unit"
    }
  }
}
```

## Troubleshooting

### Problemas Comunes

1. **Tests que fallan intermitentemente**
   - Verificar que los mocks están siendo limpiados
   - Usar `jest.clearAllMocks()` en `beforeEach`

2. **Timeout en tests**
   - Aumentar `testTimeout` en configuración
   - Verificar que las promesas están siendo resueltas

3. **Cobertura baja**
   - Revisar archivos excluidos en configuración
   - Agregar más casos de prueba para branches no cubiertos

4. **Mocks no funcionan**
   - Verificar que los mocks están siendo importados correctamente
   - Usar `jest.mock()` antes de las importaciones

### Comandos Útiles
```bash
# Limpiar caché de Jest
npm run test:clear

# Ejecutar tests con más información
npm test -- --verbose

# Ejecutar tests en modo watch
npm run test:watch

# Ver cobertura en navegador
open coverage/lcov-report/index.html
```

## Contribución

### Agregar Nuevas Pruebas
1. Crear archivo `.test.ts` en la carpeta correspondiente
2. Seguir la estructura existente
3. Incluir casos de prueba para éxito y error
4. Verificar que la cobertura se mantiene arriba del 40%

### Mantenimiento
- Ejecutar pruebas antes de cada commit
- Mantener cobertura de código alta
- Actualizar mocks cuando cambien las dependencias
- Documentar casos de prueba complejos
