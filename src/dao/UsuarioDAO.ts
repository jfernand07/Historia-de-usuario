import { Usuario, UsuarioAttributes, UsuarioCreationAttributes } from '../models/Usuario';
import { BaseDAO } from './BaseDAO';
import { Logger } from '../utils/helpers';
import { Op } from 'sequelize';

export interface UsuarioFilters {
  rol?: 'admin' | 'vendedor';
  activo?: boolean;
  search?: string;
}

export interface UsuarioPaginationOptions {
  page?: number;
  limit?: number;
  offset?: number;
}

export interface UsuarioListResult {
  usuarios: Usuario[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export class UsuarioDAO {
  /**
   * Create a new user
   */
  async create(data: UsuarioCreationAttributes): Promise<Usuario> {
    try {
      const usuario = await Usuario.create(data);
      Logger.info(`Usuario created: ${usuario.email}`);
      return usuario;
    } catch (error) {
      Logger.error('Error creating usuario:', error);
      throw error;
    }
  }

  /**
   * Find user by ID
   */
  async findById(id: number): Promise<Usuario | null> {
    try {
      return await Usuario.findByPk(id);
    } catch (error) {
      Logger.error('Error finding usuario by ID:', error);
      throw error;
    }
  }

  /**
   * Find all usuarios (required by BaseDAO interface)
   */
  async findAll(options?: any): Promise<UsuarioListResult> {
    if (options && (options.filters || options.pagination)) {
      return await this.findAllUsuarios(options);
    }
    const usuarios = await Usuario.findAll(options);
    return {
      usuarios,
      total: usuarios.length,
      page: 1,
      limit: usuarios.length,
      totalPages: 1
    };
  }

  /**
   * Find all users with optional filters and pagination
   */
  async findAllUsuarios(options?: {
    filters?: UsuarioFilters;
    pagination?: UsuarioPaginationOptions;
    order?: [string, 'ASC' | 'DESC'][];
  }): Promise<UsuarioListResult> {
    try {
      const {
        filters = {},
        pagination = { page: 1, limit: 10 },
        order = [['createdAt', 'DESC']]
      } = options || {};

      const { page = 1, limit = 10, offset = (page - 1) * limit } = pagination;
      
      // Build where clause
      const whereClause: any = {};
      
      if (filters.rol) {
        whereClause.rol = filters.rol;
      }
      
      if (filters.activo !== undefined) {
        whereClause.activo = filters.activo;
      }
      
      if (filters.search) {
        whereClause[Op.or] = [
          { nombre: { [Op.iLike]: `%${filters.search}%` } },
          { email: { [Op.iLike]: `%${filters.search}%` } }
        ];
      }

      // Get total count
      const total = await Usuario.count({ where: whereClause });
      
      // Get paginated results
      const usuarios = await Usuario.findAll({
        where: whereClause,
        order,
        limit,
        offset,
        attributes: { exclude: ['password'] } // Exclude password from results
      });

      const totalPages = Math.ceil(total / limit);

      return {
        usuarios,
        total,
        page,
        limit,
        totalPages
      };
    } catch (error) {
      Logger.error('Error finding usuarios:', error);
      throw error;
    }
  }

  /**
   * Update user by ID
   */
  async update(id: number, data: Partial<UsuarioAttributes>): Promise<Usuario | null> {
    try {
      const usuario = await Usuario.findByPk(id);
      
      if (!usuario) {
        return null;
      }

      await usuario.update(data);
      Logger.info(`Usuario updated: ${usuario.email}`);
      return usuario;
    } catch (error) {
      Logger.error('Error updating usuario:', error);
      throw error;
    }
  }

  /**
   * Delete user by ID (soft delete by setting activo to false)
   */
  async delete(id: number): Promise<boolean> {
    try {
      const usuario = await Usuario.findByPk(id);
      
      if (!usuario) {
        return false;
      }

      await usuario.update({ activo: false });
      Logger.info(`Usuario deactivated: ${usuario.email}`);
      return true;
    } catch (error) {
      Logger.error('Error deleting usuario:', error);
      throw error;
    }
  }

  /**
   * Find user by email
   */
  async findByEmail(email: string): Promise<Usuario | null> {
    try {
      return await Usuario.findOne({ where: { email } });
    } catch (error) {
      Logger.error('Error finding usuario by email:', error);
      throw error;
    }
  }

  /**
   * Find active user by email
   */
  async findActiveByEmail(email: string): Promise<Usuario | null> {
    try {
      return await Usuario.findOne({ 
        where: { 
          email,
          activo: true 
        } 
      });
    } catch (error) {
      Logger.error('Error finding active usuario by email:', error);
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

      const count = await Usuario.count({ where: whereClause });
      return count > 0;
    } catch (error) {
      Logger.error('Error checking email existence:', error);
      throw error;
    }
  }

  /**
   * Get user statistics
   */
  async getUsuarioStatistics(): Promise<{
    total: number;
    active: number;
    inactive: number;
    admins: number;
    vendedores: number;
  }> {
    try {
      const [total, active, inactive, admins, vendedores] = await Promise.all([
        Usuario.count(),
        Usuario.count({ where: { activo: true } }),
        Usuario.count({ where: { activo: false } }),
        Usuario.count({ where: { rol: 'admin' } }),
        Usuario.count({ where: { rol: 'vendedor' } })
      ]);

      return {
        total,
        active,
        inactive,
        admins,
        vendedores
      };
    } catch (error) {
      Logger.error('Error getting usuario statistics:', error);
      throw error;
    }
  }

  /**
   * Hard delete user (permanent deletion)
   */
  async hardDelete(id: number): Promise<boolean> {
    try {
      const usuario = await Usuario.findByPk(id);
      
      if (!usuario) {
        return false;
      }

      await usuario.destroy();
      Logger.info(`Usuario permanently deleted: ${usuario.email}`);
      return true;
    } catch (error) {
      Logger.error('Error hard deleting usuario:', error);
      throw error;
    }
  }

  /**
   * Get usuario statistics
   */
  async getStatistics(): Promise<{
    total: number;
    active: number;
    inactive: number;
    createdAt: {
      today: number;
      thisWeek: number;
      thisMonth: number;
    };
  }> {
    try {
      const total = await Usuario.count();
      const active = await Usuario.count({ where: { activo: true } });
      const inactive = await Usuario.count({ where: { activo: false } });
      
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      const thisWeek = new Date();
      thisWeek.setDate(today.getDate() - 7);
      
      const thisMonth = new Date();
      thisMonth.setMonth(today.getMonth() - 1);
      
      const createdAt = {
        today: await Usuario.count({ where: { createdAt: { [Op.gte]: today } } }),
        thisWeek: await Usuario.count({ where: { createdAt: { [Op.gte]: thisWeek } } }),
        thisMonth: await Usuario.count({ where: { createdAt: { [Op.gte]: thisMonth } } })
      };
      
      return {
        total,
        active,
        inactive,
        createdAt
      };
    } catch (error) {
      Logger.error('Error getting usuario statistics:', error);
      throw error;
    }
  }
}
