import { DataTypes, Model, Optional } from 'sequelize';
import { database } from '../database/connection';

// DetallePedido attributes interface
export interface DetallePedidoAttributes {
  id: number;
  pedidoId: number;
  productoId: number;
  cantidad: number;
  precioUnitario: number;
  subtotal: number;
  createdAt?: Date;
  updatedAt?: Date;
}

// DetallePedido creation attributes (optional id)
export interface DetallePedidoCreationAttributes extends Optional<DetallePedidoAttributes, 'id' | 'createdAt' | 'updatedAt'> {}

// DetallePedido model class
export class DetallePedido extends Model<DetallePedidoAttributes, DetallePedidoCreationAttributes> implements DetallePedidoAttributes {
  public id!: number;
  public pedidoId!: number;
  public productoId!: number;
  public cantidad!: number;
  public precioUnitario!: number;
  public subtotal!: number;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

// Initialize DetallePedido model
DetallePedido.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    pedidoId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'pedidos',
        key: 'id'
      }
    },
    productoId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'productos',
        key: 'id'
      }
    },
    cantidad: {
      type: DataTypes.INTEGER,
      allowNull: false,
      validate: {
        min: 1,
      },
    },
    precioUnitario: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
      validate: {
        min: 0,
      },
    },
    subtotal: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
      validate: {
        min: 0,
      },
    },
  },
  {
    sequelize: database.getSequelize(),
    tableName: 'detalle_pedidos',
    timestamps: true,
  }
);

export default DetallePedido;
