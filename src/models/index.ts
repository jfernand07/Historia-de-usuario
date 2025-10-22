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
                       │ observaciones                          │
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
- PEDIDOS.estado must be 'pendiente', 'confirmado', 'enviado', 'entregado', or 'cancelado'
- DETALLE_PEDIDOS.cantidad must be >= 1
- DETALLE_PEDIDOS.precioUnitario and subtotal must be >= 0
*/

// Import all models
import Usuario from './Usuario';
import Producto from './Producto';
import Cliente from './Cliente';
import Pedido from './Pedido';
import DetallePedido from './DetallePedido';

// Define relationships
Usuario.hasMany(Pedido, { foreignKey: 'usuarioId', as: 'pedidos' });
Pedido.belongsTo(Usuario, { foreignKey: 'usuarioId', as: 'usuario' });

Cliente.hasMany(Pedido, { foreignKey: 'clienteId', as: 'pedidos' });
Pedido.belongsTo(Cliente, { foreignKey: 'clienteId', as: 'cliente' });

Pedido.hasMany(DetallePedido, { foreignKey: 'pedidoId', as: 'detalles' });
DetallePedido.belongsTo(Pedido, { foreignKey: 'pedidoId', as: 'pedido' });

Producto.hasMany(DetallePedido, { foreignKey: 'productoId', as: 'detallePedidos' });
DetallePedido.belongsTo(Producto, { foreignKey: 'productoId', as: 'producto' });

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
  
  // Pedido relationships
  Pedido: {
    cliente: 'belongsTo';
    usuario: 'belongsTo';
    detalles: 'hasMany';
  };
  
  // DetallePedido relationships
  DetallePedido: {
    pedido: 'belongsTo';
    producto: 'belongsTo';
  };
}

// Export all models
export {
  Usuario,
  Producto,
  Cliente,
  Pedido,
  DetallePedido
};
