import { Pedido, PedidoAttributes, PedidoCreationAttributes } from '../models/Pedido';
import { DetallePedido, DetallePedidoAttributes, DetallePedidoCreationAttributes } from '../models/DetallePedido';
import { BaseDAO } from '../types/database';
import { Logger } from '../utils/helpers';
import { Op } from 'sequelize';

export interface PedidoFilters {
  clienteId?: number;
  usuarioId?: number;
  estado?: 'pendiente' | 'confirmado' | 'enviado' | 'entregado' | 'cancelado';
  fechaInicio?: Date;
  fechaFin?: Date;
  productoId?: number;
}

export interface PedidoPaginationOptions {
  page?: number;
  limit?: number;
  offset?: number;
}

export interface PedidoListResult {
  pedidos: Pedido[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface PedidoWithDetails extends Pedido {
  detalles: DetallePedido[];
  cliente?: any;
  usuario?: any;
}

export interface PedidoStatistics {
  total: number;
  pendientes: number;
  confirmados: number;
  enviados: number;
  entregados: number;
  cancelados: number;
  totalValue: number;
  averageValue: number;
  estados: { [key: string]: number };
}

export class PedidoDAO implements BaseDAO<Pedido> {
  /**
   * Create a new pedido with detalles
   */
  async create(data: PedidoCreationAttributes & { detalles: DetallePedidoCreationAttributes[] }): Promise<PedidoWithDetails> {
    try {
      const { detalles, ...pedidoData } = data;
      
      // Calculate total
      const total = detalles.reduce((sum, detalle) => {
        const subtotal = detalle.cantidad * parseFloat(detalle.precioUnitario.toString());
        return sum + subtotal;
      }, 0);

      // Create pedido
      const pedido = await Pedido.create({
        ...pedidoData,
        total
      });

      // Create detalles
      const detallesCreados = await Promise.all(
        detalles.map(detalle => 
          DetallePedido.create({
            ...detalle,
            pedidoId: pedido.id,
            subtotal: detalle.cantidad * parseFloat(detalle.precioUnitario.toString())
          })
        )
      );

      Logger.info(`Pedido created: ${pedido.id} with ${detallesCreados.length} detalles`);
      
      return {
        ...pedido.toJSON(),
        detalles: detallesCreados
      } as PedidoWithDetails;
    } catch (error) {
      Logger.error('Error creating pedido:', error);
      throw error;
    }
  }

  /**
   * Find pedido by ID with detalles
   */
  async findById(id: number): Promise<PedidoWithDetails | null> {
    try {
      const pedido = await Pedido.findByPk(id);
      
      if (!pedido) {
        return null;
      }

      const detalles = await DetallePedido.findAll({
        where: { pedidoId: id }
      });

      return {
        ...pedido.toJSON(),
        detalles
      } as PedidoWithDetails;
    } catch (error) {
      Logger.error('Error finding pedido by ID:', error);
      throw error;
    }
  }

  /**
   * Find all pedidos with optional filters and pagination
   */
  async findAll(options?: {
    filters?: PedidoFilters;
    pagination?: PedidoPaginationOptions;
    order?: [string, 'ASC' | 'DESC'][];
    includeDetails?: boolean;
  }): Promise<PedidoListResult> {
    try {
      const {
        filters = {},
        pagination = { page: 1, limit: 10 },
        order = [['createdAt', 'DESC']],
        includeDetails = false
      } = options || {};

      const { page = 1, limit = 10, offset = (page - 1) * limit } = pagination;
      
      // Build where clause
      const whereClause: any = {};
      
      if (filters.clienteId) {
        whereClause.clienteId = filters.clienteId;
      }
      
      if (filters.usuarioId) {
        whereClause.usuarioId = filters.usuarioId;
      }
      
      if (filters.estado) {
        whereClause.estado = filters.estado;
      }

      if (filters.fechaInicio || filters.fechaFin) {
        whereClause.fecha = {};
        if (filters.fechaInicio) {
          whereClause.fecha[Op.gte] = filters.fechaInicio;
        }
        if (filters.fechaFin) {
          whereClause.fecha[Op.lte] = filters.fechaFin;
        }
      }

      // Get total count
      const total = await Pedido.count({ where: whereClause });
      
      // Get paginated results
      const pedidos = await Pedido.findAll({
        where: whereClause,
        order,
        limit,
        offset
      });

      // Include detalles if requested
      let pedidosWithDetails = pedidos;
      if (includeDetails) {
        pedidosWithDetails = await Promise.all(
          pedidos.map(async (pedido) => {
            const detalles = await DetallePedido.findAll({
              where: { pedidoId: pedido.id }
            });
            return {
              ...pedido.toJSON(),
              detalles
            };
          })
        );
      }

      const totalPages = Math.ceil(total / limit);

      return {
        pedidos: pedidosWithDetails as Pedido[],
        total,
        page,
        limit,
        totalPages
      };
    } catch (error) {
      Logger.error('Error finding pedidos:', error);
      throw error;
    }
  }

  /**
   * Update pedido by ID
   */
  async update(id: number, data: Partial<PedidoAttributes>): Promise<Pedido | null> {
    try {
      const pedido = await Pedido.findByPk(id);
      
      if (!pedido) {
        return null;
      }

      await pedido.update(data);
      Logger.info(`Pedido updated: ${pedido.id}`);
      return pedido;
    } catch (error) {
      Logger.error('Error updating pedido:', error);
      throw error;
    }
  }

  /**
   * Delete pedido by ID (cascade delete detalles)
   */
  async delete(id: number): Promise<boolean> {
    try {
      const pedido = await Pedido.findByPk(id);
      
      if (!pedido) {
        return false;
      }

      // Delete detalles first
      await DetallePedido.destroy({ where: { pedidoId: id } });
      
      // Delete pedido
      await pedido.destroy();
      
      Logger.info(`Pedido deleted: ${pedido.id}`);
      return true;
    } catch (error) {
      Logger.error('Error deleting pedido:', error);
      throw error;
    }
  }

  /**
   * Find pedidos by cliente
   */
  async findByCliente(clienteId: number, includeDetails: boolean = true): Promise<PedidoWithDetails[]> {
    try {
      const pedidos = await Pedido.findAll({
        where: { clienteId },
        order: [['fecha', 'DESC']]
      });

      if (!includeDetails) {
        return pedidos as PedidoWithDetails[];
      }

      const pedidosWithDetails = await Promise.all(
        pedidos.map(async (pedido) => {
          const detalles = await DetallePedido.findAll({
            where: { pedidoId: pedido.id }
          });
          return {
            ...pedido.toJSON(),
            detalles
          };
        })
      );

      return pedidosWithDetails as PedidoWithDetails[];
    } catch (error) {
      Logger.error('Error finding pedidos by cliente:', error);
      throw error;
    }
  }

  /**
   * Find pedidos by producto
   */
  async findByProducto(productoId: number): Promise<PedidoWithDetails[]> {
    try {
      const detalles = await DetallePedido.findAll({
        where: { productoId }
      });

      const pedidoIds = detalles.map(detalle => detalle.pedidoId);
      
      if (pedidoIds.length === 0) {
        return [];
      }

      const pedidos = await Pedido.findAll({
        where: { id: { [Op.in]: pedidoIds } },
        order: [['fecha', 'DESC']]
      });

      const pedidosWithDetails = await Promise.all(
        pedidos.map(async (pedido) => {
          const pedidoDetalles = await DetallePedido.findAll({
            where: { pedidoId: pedido.id }
          });
          return {
            ...pedido.toJSON(),
            detalles: pedidoDetalles
          };
        })
      );

      return pedidosWithDetails as PedidoWithDetails[];
    } catch (error) {
      Logger.error('Error finding pedidos by producto:', error);
      throw error;
    }
  }

  /**
   * Update pedido estado
   */
  async updateEstado(id: number, estado: 'pendiente' | 'confirmado' | 'enviado' | 'entregado' | 'cancelado'): Promise<Pedido | null> {
    try {
      const pedido = await Pedido.findByPk(id);
      
      if (!pedido) {
        return null;
      }

      await pedido.update({ estado });
      Logger.info(`Pedido estado updated: ${pedido.id} -> ${estado}`);
      return pedido;
    } catch (error) {
      Logger.error('Error updating pedido estado:', error);
      throw error;
    }
  }

  /**
   * Get pedido statistics
   */
  async getStatistics(): Promise<PedidoStatistics> {
    try {
      const [total, pendientes, confirmados, enviados, entregados, cancelados] = await Promise.all([
        Pedido.count(),
        Pedido.count({ where: { estado: 'pendiente' } }),
        Pedido.count({ where: { estado: 'confirmado' } }),
        Pedido.count({ where: { estado: 'enviado' } }),
        Pedido.count({ where: { estado: 'entregado' } }),
        Pedido.count({ where: { estado: 'cancelado' } })
      ]);

      // Get estados count
      const estadoResults = await Pedido.findAll({
        attributes: ['estado', [Pedido.sequelize!.fn('COUNT', Pedido.sequelize!.col('id')), 'count']],
        group: ['estado']
      });

      const estados: { [key: string]: number } = {};
      estadoResults.forEach((result: any) => {
        estados[result.estado] = parseInt(result.dataValues.count);
      });

      // Calculate total and average value
      const totalValueResult = await Pedido.findOne({
        attributes: [[Pedido.sequelize!.fn('SUM', Pedido.sequelize!.col('total')), 'totalValue']]
      });

      const totalValue = parseFloat((totalValueResult as any)?.dataValues?.totalValue || '0');
      const averageValue = total > 0 ? totalValue / total : 0;

      return {
        total,
        pendientes,
        confirmados,
        enviados,
        entregados,
        cancelados,
        totalValue,
        averageValue,
        estados
      };
    } catch (error) {
      Logger.error('Error getting pedido statistics:', error);
      throw error;
    }
  }

  /**
   * Get pedidos by date range
   */
  async findByDateRange(fechaInicio: Date, fechaFin: Date): Promise<PedidoWithDetails[]> {
    try {
      const pedidos = await Pedido.findAll({
        where: {
          fecha: {
            [Op.between]: [fechaInicio, fechaFin]
          }
        },
        order: [['fecha', 'DESC']]
      });

      const pedidosWithDetails = await Promise.all(
        pedidos.map(async (pedido) => {
          const detalles = await DetallePedido.findAll({
            where: { pedidoId: pedido.id }
          });
          return {
            ...pedido.toJSON(),
            detalles
          };
        })
      );

      return pedidosWithDetails as PedidoWithDetails[];
    } catch (error) {
      Logger.error('Error finding pedidos by date range:', error);
      throw error;
    }
  }
}
