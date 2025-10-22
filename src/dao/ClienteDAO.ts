import { Cliente, ClienteAttributes, ClienteCreationAttributes } from '../models/Cliente';
import { BaseDAO } from '../types/database';
import { Logger } from '../utils/helpers';
import { Op } from 'sequelize';

export interface ClienteFilters {
  tipoDocumento?: 'cedula' | 'pasaporte' | 'nit';
  activo?: boolean;
  search?: string;
}

export interface ClientePaginationOptions {
  page?: number;
  limit?: number;
  offset?: number;
}

export interface ClienteListResult {
  clientes: Cliente[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface ClienteStatistics {
  total: number;
  active: number;
  inactive: number;
  cedulas: number;
  pasaportes: number;
  nits: number;
  documentTypes: { [key: string]: number };
}

export class ClienteDAO implements BaseDAO<Cliente> {
  /**
   * Create a new cliente
   */
  async create(data: ClienteCreationAttributes): Promise<Cliente> {
    try {
      const cliente = await Cliente.create(data);
      Logger.info(`Cliente created: ${cliente.documento}`);
      return cliente;
    } catch (error) {
      Logger.error('Error creating cliente:', error);
      throw error;
    }
  }

  /**
   * Find cliente by ID
   */
  async findById(id: number): Promise<Cliente | null> {
    try {
      return await Cliente.findByPk(id);
    } catch (error) {
      Logger.error('Error finding cliente by ID:', error);
      throw error;
    }
  }

  /**
   * Find cliente by document
   */
  async findByDocument(documento: string): Promise<Cliente | null> {
    try {
      return await Cliente.findOne({ where: { documento } });
    } catch (error) {
      Logger.error('Error finding cliente by document:', error);
      throw error;
    }
  }

  /**
   * Find cliente by email
   */
  async findByEmail(email: string): Promise<Cliente | null> {
    try {
      return await Cliente.findOne({ where: { email } });
    } catch (error) {
      Logger.error('Error finding cliente by email:', error);
      throw error;
    }
  }

  /**
   * Find all clientes with optional filters and pagination
   */
  async findAll(options?: {
    filters?: ClienteFilters;
    pagination?: ClientePaginationOptions;
    order?: [string, 'ASC' | 'DESC'][];
  }): Promise<ClienteListResult> {
    try {
      const {
        filters = {},
        pagination = { page: 1, limit: 10 },
        order = [['createdAt', 'DESC']]
      } = options || {};

      const { page = 1, limit = 10, offset = (page - 1) * limit } = pagination;
      
      // Build where clause
      const whereClause: any = {};
      
      if (filters.tipoDocumento) {
        whereClause.tipoDocumento = filters.tipoDocumento;
      }
      
      if (filters.activo !== undefined) {
        whereClause.activo = filters.activo;
      }
      
      if (filters.search) {
        whereClause[Op.or] = [
          { nombre: { [Op.iLike]: `%${filters.search}%` } },
          { email: { [Op.iLike]: `%${filters.search}%` } },
          { documento: { [Op.iLike]: `%${filters.search}%` } }
        ];
      }

      // Get total count
      const total = await Cliente.count({ where: whereClause });
      
      // Get paginated results
      const clientes = await Cliente.findAll({
        where: whereClause,
        order,
        limit,
        offset
      });

      const totalPages = Math.ceil(total / limit);

      return {
        clientes,
        total,
        page,
        limit,
        totalPages
      };
    } catch (error) {
      Logger.error('Error finding clientes:', error);
      throw error;
    }
  }

  /**
   * Update cliente by ID
   */
  async update(id: number, data: Partial<ClienteAttributes>): Promise<Cliente | null> {
    try {
      const cliente = await Cliente.findByPk(id);
      
      if (!cliente) {
        return null;
      }

      await cliente.update(data);
      Logger.info(`Cliente updated: ${cliente.documento}`);
      return cliente;
    } catch (error) {
      Logger.error('Error updating cliente:', error);
      throw error;
    }
  }

  /**
   * Delete cliente by ID (soft delete by setting activo to false)
   */
  async delete(id: number): Promise<boolean> {
    try {
      const cliente = await Cliente.findByPk(id);
      
      if (!cliente) {
        return false;
      }

      await cliente.update({ activo: false });
      Logger.info(`Cliente deactivated: ${cliente.documento}`);
      return true;
    } catch (error) {
      Logger.error('Error deleting cliente:', error);
      throw error;
    }
  }

  /**
   * Check if document exists
   */
  async documentExists(documento: string, excludeId?: number): Promise<boolean> {
    try {
      const whereClause: any = { documento };
      
      if (excludeId) {
        whereClause.id = { [Op.ne]: excludeId };
      }

      const count = await Cliente.count({ where: whereClause });
      return count > 0;
    } catch (error) {
      Logger.error('Error checking document existence:', error);
      throw error;
    }
  }

  /**
   * Check if email exists
   */
  async emailExists(email: string, excludeId?: number): Promise<boolean> {
    try {
      const whereClause: any = { email };
      
      if (excludeId) {
        whereClause.id = { [Op.ne]: excludeId };
      }

      const count = await Cliente.count({ where: whereClause });
      return count > 0;
    } catch (error) {
      Logger.error('Error checking email existence:', error);
      throw error;
    }
  }

  /**
   * Find clientes by document type
   */
  async findByDocumentType(tipoDocumento: 'cedula' | 'pasaporte' | 'nit', activo: boolean = true): Promise<Cliente[]> {
    try {
      return await Cliente.findAll({
        where: {
          tipoDocumento,
          activo
        },
        order: [['nombre', 'ASC']]
      });
    } catch (error) {
      Logger.error('Error finding clientes by document type:', error);
      throw error;
    }
  }

  /**
   * Find recent clientes
   */
  async findRecent(days: number = 30, limit: number = 10): Promise<Cliente[]> {
    try {
      const dateThreshold = new Date();
      dateThreshold.setDate(dateThreshold.getDate() - days);

      return await Cliente.findAll({
        where: {
          createdAt: { [Op.gte]: dateThreshold },
          activo: true
        },
        order: [['createdAt', 'DESC']],
        limit
      });
    } catch (error) {
      Logger.error('Error finding recent clientes:', error);
      throw error;
    }
  }

  /**
   * Get all document types
   */
  async getDocumentTypes(): Promise<string[]> {
    try {
      const clientes = await Cliente.findAll({
        attributes: ['tipoDocumento'],
        where: { activo: true },
        group: ['tipoDocumento'],
        order: [['tipoDocumento', 'ASC']]
      });

      return clientes.map(c => c.tipoDocumento);
    } catch (error) {
      Logger.error('Error getting document types:', error);
      throw error;
    }
  }

  /**
   * Get cliente statistics
   */
  async getStatistics(): Promise<ClienteStatistics> {
    try {
      const [total, active, inactive, cedulas, pasaportes, nits] = await Promise.all([
        Cliente.count(),
        Cliente.count({ where: { activo: true } }),
        Cliente.count({ where: { activo: false } }),
        Cliente.count({ where: { tipoDocumento: 'cedula' } }),
        Cliente.count({ where: { tipoDocumento: 'pasaporte' } }),
        Cliente.count({ where: { tipoDocumento: 'nit' } })
      ]);

      // Get document types count
      const documentTypeResults = await Cliente.findAll({
        attributes: ['tipoDocumento', [Cliente.sequelize!.fn('COUNT', Cliente.sequelize!.col('id')), 'count']],
        where: { activo: true },
        group: ['tipoDocumento']
      });

      const documentTypes: { [key: string]: number } = {};
      documentTypeResults.forEach((result: any) => {
        documentTypes[result.tipoDocumento] = parseInt(result.dataValues.count);
      });

      return {
        total,
        active,
        inactive,
        cedulas,
        pasaportes,
        nits,
        documentTypes
      };
    } catch (error) {
      Logger.error('Error getting cliente statistics:', error);
      throw error;
    }
  }

  /**
   * Hard delete cliente (permanent deletion)
   */
  async hardDelete(id: number): Promise<boolean> {
    try {
      const cliente = await Cliente.findByPk(id);
      
      if (!cliente) {
        return false;
      }

      await cliente.destroy();
      Logger.info(`Cliente permanently deleted: ${cliente.documento}`);
      return true;
    } catch (error) {
      Logger.error('Error hard deleting cliente:', error);
      throw error;
    }
  }
}
