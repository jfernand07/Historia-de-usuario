import { Producto, ProductoAttributes, ProductoCreationAttributes } from '../models/Producto';
import { BaseDAO } from './BaseDAO';
import { Logger } from '../utils/helpers';
import { Op } from 'sequelize';

export interface ProductoFilters {
  categoria?: string;
  activo?: boolean;
  search?: string;
  minPrecio?: number;
  maxPrecio?: number;
}

export interface ProductoPaginationOptions {
  page?: number;
  limit?: number;
  offset?: number;
}

export interface ProductoListResult {
  productos: Producto[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface ProductoStatistics {
  total: number;
  active: number;
  inactive: number;
  lowStock: number;
  categories: { [key: string]: number };
  totalValue: number;
}

export class ProductoDAO {
  /**
   * Create a new producto
   */
  async create(data: ProductoCreationAttributes): Promise<Producto> {
    try {
      const producto = await Producto.create(data);
      Logger.info(`Producto created: ${producto.codigo}`);
      return producto;
    } catch (error) {
      Logger.error('Error creating producto:', error);
      throw error;
    }
  }

  /**
   * Find producto by ID
   */
  async findById(id: number): Promise<Producto | null> {
    try {
      return await Producto.findByPk(id);
    } catch (error) {
      Logger.error('Error finding producto by ID:', error);
      throw error;
    }
  }

  /**
   * Find producto by code
   */
  async findByCode(codigo: string): Promise<Producto | null> {
    try {
      return await Producto.findOne({ where: { codigo } });
    } catch (error) {
      Logger.error('Error finding producto by code:', error);
      throw error;
    }
  }

  /**
   * Find all productos (required by BaseDAO interface)
   */
  async findAll(options?: any): Promise<ProductoListResult> {
    if (options && (options.filters || options.pagination)) {
      return await this.findAllProductos(options);
    }
    const productos = await Producto.findAll(options);
    return {
      productos,
      total: productos.length,
      page: 1,
      limit: productos.length,
      totalPages: 1
    };
  }

  /**
   * Find all productos with optional filters and pagination
   */
  async findAllProductos(options?: {
    filters?: ProductoFilters;
    pagination?: ProductoPaginationOptions;
    order?: [string, 'ASC' | 'DESC'][];
  }): Promise<ProductoListResult> {
    try {
      const {
        filters = {},
        pagination = { page: 1, limit: 10 },
        order = [['createdAt', 'DESC']]
      } = options || {};

      const { page = 1, limit = 10, offset = (page - 1) * limit } = pagination;
      
      // Build where clause
      const whereClause: any = {};
      
      if (filters.categoria) {
        whereClause.categoria = filters.categoria;
      }
      
      if (filters.activo !== undefined) {
        whereClause.activo = filters.activo;
      }
      
      if (filters.search) {
        whereClause[Op.or] = [
          { nombre: { [Op.iLike]: `%${filters.search}%` } },
          { codigo: { [Op.iLike]: `%${filters.search}%` } },
          { descripcion: { [Op.iLike]: `%${filters.search}%` } }
        ];
      }

      if (filters.minPrecio !== undefined) {
        whereClause.precio = { [Op.gte]: filters.minPrecio };
      }

      if (filters.maxPrecio !== undefined) {
        whereClause.precio = { 
          ...whereClause.precio,
          [Op.lte]: filters.maxPrecio 
        };
      }

      // Get total count
      const total = await Producto.count({ where: whereClause });
      
      // Get paginated results
      const productos = await Producto.findAll({
        where: whereClause,
        order,
        limit,
        offset
      });

      const totalPages = Math.ceil(total / limit);

      return {
        productos,
        total,
        page,
        limit,
        totalPages
      };
    } catch (error) {
      Logger.error('Error finding productos:', error);
      throw error;
    }
  }

  /**
   * Update producto by ID
   */
  async update(id: number, data: Partial<ProductoAttributes>): Promise<Producto | null> {
    try {
      const producto = await Producto.findByPk(id);
      
      if (!producto) {
        return null;
      }

      await producto.update(data);
      Logger.info(`Producto updated: ${producto.codigo}`);
      return producto;
    } catch (error) {
      Logger.error('Error updating producto:', error);
      throw error;
    }
  }

  /**
   * Delete producto by ID (soft delete by setting activo to false)
   */
  async delete(id: number): Promise<boolean> {
    try {
      const producto = await Producto.findByPk(id);
      
      if (!producto) {
        return false;
      }

      await producto.update({ activo: false });
      Logger.info(`Producto deactivated: ${producto.codigo}`);
      return true;
    } catch (error) {
      Logger.error('Error deleting producto:', error);
      throw error;
    }
  }

  /**
   * Check if code exists
   */
  async codeExists(codigo: string, excludeId?: number): Promise<boolean> {
    try {
      const whereClause: any = { codigo };
      
      if (excludeId) {
        whereClause.id = { [Op.ne]: excludeId };
      }

      const count = await Producto.count({ where: whereClause });
      return count > 0;
    } catch (error) {
      Logger.error('Error checking code existence:', error);
      throw error;
    }
  }

  /**
   * Update stock
   */
  async updateStock(id: number, cantidad: number, operacion: 'add' | 'subtract' | 'set'): Promise<Producto | null> {
    try {
      const producto = await Producto.findByPk(id);
      
      if (!producto) {
        return null;
      }

      let newStock = producto.stock;
      
      switch (operacion) {
        case 'add':
          newStock += cantidad;
          break;
        case 'subtract':
          newStock = Math.max(0, newStock - cantidad);
          break;
        case 'set':
          newStock = cantidad;
          break;
      }

      await producto.update({ stock: newStock });
      Logger.info(`Stock updated for producto ${producto.codigo}: ${operacion} ${cantidad}`);
      
      return producto;
    } catch (error) {
      Logger.error('Error updating stock:', error);
      throw error;
    }
  }

  /**
   * Find low stock productos
   */
  async findLowStock(threshold: number = 10): Promise<Producto[]> {
    try {
      return await Producto.findAll({
        where: {
          stock: { [Op.lte]: threshold },
          activo: true
        },
        order: [['stock', 'ASC']]
      });
    } catch (error) {
      Logger.error('Error finding low stock productos:', error);
      throw error;
    }
  }

  /**
   * Get productos by category
   */
  async findByCategory(categoria: string, activo: boolean = true): Promise<Producto[]> {
    try {
      return await Producto.findAll({
        where: {
          categoria,
          activo
        },
        order: [['nombre', 'ASC']]
      });
    } catch (error) {
      Logger.error('Error finding productos by category:', error);
      throw error;
    }
  }

  /**
   * Get all categories
   */
  async getCategories(): Promise<string[]> {
    try {
      const productos = await Producto.findAll({
        attributes: ['categoria'],
        where: { activo: true },
        group: ['categoria'],
        order: [['categoria', 'ASC']]
      });

      return productos.map(p => p.categoria);
    } catch (error) {
      Logger.error('Error getting categories:', error);
      throw error;
    }
  }

  /**
   * Get producto statistics
   */
  async getProductoStatistics(): Promise<ProductoStatistics> {
    try {
      const [total, active, inactive, lowStock] = await Promise.all([
        Producto.count(),
        Producto.count({ where: { activo: true } }),
        Producto.count({ where: { activo: false } }),
        Producto.count({ where: { stock: { [Op.lte]: 10 }, activo: true } })
      ]);

      // Get categories count
      const categoryResults = await Producto.findAll({
        attributes: ['categoria', [Producto.sequelize!.fn('COUNT', Producto.sequelize!.col('id')), 'count']],
        where: { activo: true },
        group: ['categoria']
      });

      const categories: { [key: string]: number } = {};
      categoryResults.forEach((result: any) => {
        categories[result.categoria] = parseInt(result.dataValues.count);
      });

      // Calculate total value
      const totalValueResult = await Producto.findOne({
        attributes: [[Producto.sequelize!.fn('SUM', Producto.sequelize!.literal('precio * stock')), 'totalValue']],
        where: { activo: true }
      });

      const totalValue = parseFloat((totalValueResult as any)?.dataValues?.totalValue || '0');

      return {
        total,
        active,
        inactive,
        lowStock,
        categories,
        totalValue
      };
    } catch (error) {
      Logger.error('Error getting producto statistics:', error);
      throw error;
    }
  }

  /**
   * Reduce stock for a producto
   */
  async reduceStock(id: number, cantidad: number): Promise<Producto | null> {
    try {
      const producto = await Producto.findByPk(id);
      
      if (!producto) {
        return null;
      }

      if (producto.stock < cantidad) {
        throw new Error(`Insufficient stock. Available: ${producto.stock}, Required: ${cantidad}`);
      }

      const newStock = producto.stock - cantidad;
      await producto.update({ stock: newStock });
      
      Logger.info(`Stock reduced for producto ${producto.codigo}: ${cantidad} units`);
      return producto;
    } catch (error) {
      Logger.error('Error reducing stock:', error);
      throw error;
    }
  }

  /**
   * Increase stock for a producto
   */
  async increaseStock(id: number, cantidad: number): Promise<Producto | null> {
    try {
      const producto = await Producto.findByPk(id);
      
      if (!producto) {
        return null;
      }

      const newStock = producto.stock + cantidad;
      await producto.update({ stock: newStock });
      
      Logger.info(`Stock increased for producto ${producto.codigo}: ${cantidad} units`);
      return producto;
    } catch (error) {
      Logger.error('Error increasing stock:', error);
      throw error;
    }
  }

  /**
   * Find productos by IDs
   */
  async findByIds(ids: number[]): Promise<Producto[]> {
    try {
      return await Producto.findAll({
        where: {
          id: {
            [Op.in]: ids
          }
        }
      });
    } catch (error) {
      Logger.error('Error finding productos by IDs:', error);
      throw error;
    }
  }

  /**
   * Hard delete producto (permanent deletion)
   */
  async hardDelete(id: number): Promise<boolean> {
    try {
      const producto = await Producto.findByPk(id);
      
      if (!producto) {
        return false;
      }

      await producto.destroy();
      Logger.info(`Producto permanently deleted: ${producto.codigo}`);
      return true;
    } catch (error) {
      Logger.error('Error hard deleting producto:', error);
      throw error;
    }
  }

  /**
   * Get producto statistics
   */
  async getStatistics(): Promise<{
    total: number;
    active: number;
    inactive: number;
    lowStock: number;
    categories: { [key: string]: number };
    totalValue: number;
  }> {
    try {
      const total = await Producto.count();
      const active = await Producto.count({ where: { activo: true } });
      const inactive = await Producto.count({ where: { activo: false } });
      
      // Find productos with low stock (less than 10)
      const lowStock = await Producto.count({ 
        where: { 
          stock: { [Op.lt]: 10 },
          activo: true 
        } 
      });
      
      // Get categories distribution
      const productos = await Producto.findAll({
        attributes: ['categoria'],
        where: { activo: true }
      });
      
      const categories: { [key: string]: number } = {};
      productos.forEach(producto => {
        const categoria = producto.categoria || 'Sin categoría';
        categories[categoria] = (categories[categoria] || 0) + 1;
      });
      
      // Calculate total value
      const productosWithValue = await Producto.findAll({
        attributes: ['stock', 'precio'],
        where: { activo: true }
      });
      
      const totalValue = productosWithValue.reduce((sum, producto) => {
        return sum + (producto.stock * parseFloat(producto.precio.toString()));
      }, 0);
      
      return {
        total,
        active,
        inactive,
        lowStock,
        categories,
        totalValue
      };
    } catch (error) {
      Logger.error('Error getting producto statistics:', error);
      throw error;
    }
  }
}
