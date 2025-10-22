import { DataTypes, Model, Optional } from 'sequelize';
import { database } from '../database/connection';

// Producto attributes interface
export interface ProductoAttributes {
  id: number;
  codigo: string;
  nombre: string;
  descripcion?: string;
  precio: number;
  stock: number;
  categoria: string;
  activo: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}

// Producto creation attributes (optional id)
export interface ProductoCreationAttributes extends Optional<ProductoAttributes, 'id' | 'activo' | 'createdAt' | 'updatedAt'> {}

// Producto model class
export class Producto extends Model<ProductoAttributes, ProductoCreationAttributes> implements ProductoAttributes {
  public id!: number;
  public codigo!: string;
  public nombre!: string;
  public descripcion?: string;
  public precio!: number;
  public stock!: number;
  public categoria!: string;
  public activo!: boolean;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

// Initialize Producto model
Producto.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    codigo: {
      type: DataTypes.STRING(50),
      allowNull: false,
      unique: true,
    },
    nombre: {
      type: DataTypes.STRING(100),
      allowNull: false,
    },
    descripcion: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    precio: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
      validate: {
        min: 0,
      },
    },
    stock: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
      validate: {
        min: 0,
      },
    },
    categoria: {
      type: DataTypes.STRING(50),
      allowNull: false,
    },
    activo: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: true,
    },
  },
  {
    sequelize: database.getSequelize(),
    tableName: 'productos',
    timestamps: true,
  }
);

export default Producto;
