import { DataTypes, Model, Optional } from 'sequelize';
import { database } from '../database/connection';

// Cliente attributes interface
export interface ClienteAttributes {
  id: number;
  nombre: string;
  email: string;
  telefono?: string;
  direccion?: string;
  documento: string;
  tipoDocumento: 'cedula' | 'pasaporte' | 'nit';
  activo: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}

// Cliente creation attributes (optional id)
export interface ClienteCreationAttributes extends Optional<ClienteAttributes, 'id' | 'activo' | 'createdAt' | 'updatedAt'> {}

// Cliente model class
export class Cliente extends Model<ClienteAttributes, ClienteCreationAttributes> implements ClienteAttributes {
  public id!: number;
  public nombre!: string;
  public email!: string;
  public telefono?: string;
  public direccion?: string;
  public documento!: string;
  public tipoDocumento!: 'cedula' | 'pasaporte' | 'nit';
  public activo!: boolean;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

// Initialize Cliente model
Cliente.init(
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
      validate: {
        isEmail: true,
      },
    },
    telefono: {
      type: DataTypes.STRING(20),
      allowNull: true,
    },
    direccion: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    documento: {
      type: DataTypes.STRING(50),
      allowNull: false,
      unique: true,
    },
    tipoDocumento: {
      type: DataTypes.ENUM('cedula', 'pasaporte', 'nit'),
      allowNull: false,
      defaultValue: 'cedula',
    },
    activo: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: true,
    },
  },
  {
    sequelize: database.getSequelize(),
    tableName: 'clientes',
    timestamps: true,
  }
);

export default Cliente;
