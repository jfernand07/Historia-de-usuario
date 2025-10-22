import { DataTypes, Model, Optional } from 'sequelize';
import { database } from '../database/connection';

// Pedido attributes interface
export interface PedidoAttributes {
  id: number;
  clienteId: number;
  usuarioId: number;
  fecha: Date;
  total: number;
  estado: 'pendiente' | 'confirmado' | 'enviado' | 'entregado' | 'cancelado';
  observaciones?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

// Pedido creation attributes (optional id)
export interface PedidoCreationAttributes extends Optional<PedidoAttributes, 'id' | 'observaciones' | 'createdAt' | 'updatedAt'> {}

// Pedido model class
export class Pedido extends Model<PedidoAttributes, PedidoCreationAttributes> implements PedidoAttributes {
  public id!: number;
  public clienteId!: number;
  public usuarioId!: number;
  public fecha!: Date;
  public total!: number;
  public estado!: 'pendiente' | 'confirmado' | 'enviado' | 'entregado' | 'cancelado';
  public observaciones?: string;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

// Initialize Pedido model
Pedido.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    clienteId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'clientes',
        key: 'id'
      }
    },
    usuarioId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'usuarios',
        key: 'id'
      }
    },
    fecha: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
    },
    total: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
      validate: {
        min: 0,
      },
    },
    estado: {
      type: DataTypes.ENUM('pendiente', 'confirmado', 'enviado', 'entregado', 'cancelado'),
      allowNull: false,
      defaultValue: 'pendiente',
    },
    observaciones: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
  },
  {
    sequelize: database.getSequelize(),
    tableName: 'pedidos',
    timestamps: true,
  }
);

export default Pedido;
