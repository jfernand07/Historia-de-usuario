// Entity Relationship Diagram (ERD) for SportsLine Database

/*
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│     USUARIOS    │    │    PRODUCTOS    │    │    CLIENTES     │
├─────────────────┤    ├─────────────────┤    ├─────────────────┤
│ id (PK)         │    │ id (PK)         │    │ id (PK)         │
│ nombre          │    │ codigo (UK)     │    │ nombre          │
│ email (UK)      │    │ nombre          │    │ email (UK)      │
│ password        │    │ descripcion     │    │ telefono        │
│ rol             │    │ precio          │    │ direccion       │
│ activo          │    │ stock           │    │ documento (UK)  │
│ createdAt       │    │ categoria       │    │ tipoDocumento   │
│ updatedAt       │    │ activo          │    │ activo          │
└─────────────────┘    │ createdAt       │    │ createdAt       │
                       │ updatedAt       │    │ updatedAt       │
                       └─────────────────┘    └─────────────────┘
                                │                        │
                                │                        │
                                ▼                        ▼
                       ┌─────────────────────────────────────────┐
                       │              PEDIDOS                   │
                       ├─────────────────────────────────────────┤
                       │ id (PK)                                │
                       │ clienteId (FK) -> CLIENTES.id          │
                       │ usuarioId (FK) -> USUARIOS.id          │
                       │ fecha                                  │
                       │ total                                  │
                       │ estado                                 │
                       │ createdAt                              │
                       │ updatedAt                              │
                       └─────────────────────────────────────────┘
                                │
                                ▼
                       ┌─────────────────────────────────────────┐
                       │         DETALLE_PEDIDOS                │
                       ├─────────────────────────────────────────┤
                       │ id (PK)                                │
                       │ pedidoId (FK) -> PEDIDOS.id            │
                       │ productoId (FK) -> PRODUCTOS.id         │
                       │ cantidad                               │
                       │ precioUnitario                         │
                       │ subtotal                               │
                       │ createdAt                              │
                       │ updatedAt                              │
                       └─────────────────────────────────────────┘

RELATIONSHIPS:
- USUARIOS (1) ── (N) PEDIDOS
- CLIENTES (1) ── (N) PEDIDOS  
- PEDIDOS (1) ── (N) DETALLE_PEDIDOS
- PRODUCTOS (1) ── (N) DETALLE_PEDIDOS

CONSTRAINTS:
- USUARIOS.email must be unique
- PRODUCTOS.codigo must be unique
- CLIENTES.documento must be unique
- USUARIOS.rol must be 'admin' or 'vendedor'
- CLIENTES.tipoDocumento must be 'cedula', 'pasaporte', or 'nit'
- PRODUCTOS.precio and stock must be >= 0
*/

export interface DatabaseRelationships {
  // Usuario relationships
  Usuario: {
    pedidos: 'hasMany';
  };
  
  // Producto relationships
  Producto: {
    detallePedidos: 'hasMany';
  };
  
  // Cliente relationships
  Cliente: {
    pedidos: 'hasMany';
  };
  
  // Pedido relationships (to be implemented in HU#4)
  Pedido: {
    cliente: 'belongsTo';
    usuario: 'belongsTo';
    detallePedidos: 'hasMany';
  };
  
  // DetallePedido relationships (to be implemented in HU#4)
  DetallePedido: {
    pedido: 'belongsTo';
    producto: 'belongsTo';
  };
}
