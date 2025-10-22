import { DataTypes, Model, Optional } from 'sequelize';
import { database } from './connection';

// Usuario attributes interface
export interface UsuarioAttributes {
  id: number;
  nombre: string;
  email: string;
  password: string;
  rol: 'admin' | 'vendedor';
  activo: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}

// Usuario creation attributes (optional id)
export interface UsuarioCreationAttributes extends Optional<UsuarioAttributes, 'id' | 'activo' | 'createdAt' | 'updatedAt'> {}

// Usuario model class
export class Usuario extends Model<UsuarioAttributes, UsuarioCreationAttributes> implements UsuarioAttributes {
  public id!: number;
  public nombre!: string;
  public email!: string;
  public password!: string;
  public rol!: 'admin' | 'vendedor';
  public activo!: boolean;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

// Initialize Usuario model
Usuario.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    nombre: {
      type: DataTypes.STRING(100),
      allowNull: false,
    },
    email: {
      type: DataTypes.STRING(100),
      allowNull: false,
      unique: true,
      validate: {
        isEmail: true,
      },
    },
    password: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },
    rol: {
      type: DataTypes.ENUM('admin', 'vendedor'),
      allowNull: false,
      defaultValue: 'vendedor',
    },
    activo: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: true,
    },
  },
  {
    sequelize: database.getSequelize(),
    tableName: 'usuarios',
    timestamps: true,
  }
);

export default Usuario;
