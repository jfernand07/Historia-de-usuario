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

export class PedidoDAO {
  /**
   * Find all pedidos (required by BaseDAO interface)
   */
  async findAll(options?: any): Promise<PedidoListResult> {
    if (options && (options.filters || options.pagination)) {
      return await this.findAllPedidos(options);
    }
    const pedidos = await Pedido.findAll(options);
    return {
      pedidos,
      total: pedidos.length,
      page: 1,
      limit: pedidos.length,
      totalPages: 1
    };
  }

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
  async findAllPedidos(options?: {
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
            } as any;
          })
        ) as any;
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

  /**
   * Find pedidos with filters and pagination (optimized for queries)
   */
  async findAllWithFilters(filters: PedidoFilters & { page?: number; limit?: number }): Promise<{
    pedidos: PedidoWithDetails[];
    pagination: {
      page: number;
      limit: number;
      total: number;
      totalPages: number;
    };
  }> {
    try {
      const {
        clienteId,
        usuarioId,
        estado,
        fechaInicio,
        fechaFin,
        productoId,
        page = 1,
        limit = 10
      } = filters;

      const offset = (page - 1) * limit;
      
      // Build where clause
      const whereClause: any = {};
      
      if (clienteId) {
        whereClause.clienteId = clienteId;
      }
      
      if (usuarioId) {
        whereClause.usuarioId = usuarioId;
      }
      
      if (estado) {
        whereClause.estado = estado;
      }

      if (fechaInicio || fechaFin) {
        whereClause.fecha = {};
        if (fechaInicio) {
          whereClause.fecha[Op.gte] = fechaInicio;
        }
        if (fechaFin) {
          whereClause.fecha[Op.lte] = fechaFin;
        }
      }

      // If filtering by producto, we need to join with DetallePedido
      let pedidoIds: number[] = [];
      if (productoId) {
        const detalles = await DetallePedido.findAll({
          where: { productoId },
          attributes: ['pedidoId']
        });
        pedidoIds = detalles.map(d => d.pedidoId);
        
        if (pedidoIds.length === 0) {
          return {
            pedidos: [],
            pagination: { page, limit, total: 0, totalPages: 0 }
          };
        }
        
        whereClause.id = { [Op.in]: pedidoIds };
      }

      // Get total count
      const total = await Pedido.count({ where: whereClause });
      
      // Get paginated results with detalles
      const pedidos = await Pedido.findAll({
        where: whereClause,
        order: [['fecha', 'DESC']],
        limit,
        offset
      });

      // Get detalles for all pedidos in one query
      const pedidoIdsForDetalles = pedidos.map(p => p.id);
      const allDetalles = await DetallePedido.findAll({
        where: { pedidoId: { [Op.in]: pedidoIdsForDetalles } }
      });

      // Group detalles by pedidoId
      const detallesByPedido: { [key: number]: DetallePedido[] } = {};
      allDetalles.forEach(detalle => {
        if (!detallesByPedido[detalle.pedidoId]) {
          detallesByPedido[detalle.pedidoId] = [];
        }
        detallesByPedido[detalle.pedidoId].push(detalle);
      });

      // Combine pedidos with their detalles
      const pedidosWithDetails = pedidos.map(pedido => ({
        ...pedido.toJSON(),
        detalles: detallesByPedido[pedido.id] || []
      })) as PedidoWithDetails[];

      const totalPages = Math.ceil(total / limit);

      return {
        pedidos: pedidosWithDetails,
        pagination: { page, limit, total, totalPages }
      };
    } catch (error) {
      Logger.error('Error finding pedidos with filters:', error);
      throw error;
    }
  }

  /**
   * Find pedido by ID with detalles and related data
   */
  async findByIdWithDetalles(id: number): Promise<PedidoWithDetails | null> {
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
      Logger.error('Error finding pedido by ID with detalles:', error);
      throw error;
    }
  }

  /**
   * Create pedido with detalles in a transaction
   */
  async createWithDetalles(data: {
    clienteId: number;
    usuarioId: number;
    total: number;
    estado: string;
    observaciones?: string;
    detalles: Array<{
      productoId: number;
      cantidad: number;
      precioUnitario: number;
      subtotal: number;
    }>;
  }): Promise<PedidoWithDetails> {
    const transaction = await Pedido.sequelize!.transaction();
    
    try {
      // Create pedido
      const pedido = await Pedido.create({
        clienteId: data.clienteId,
        usuarioId: data.usuarioId,
        total: data.total,
        estado: data.estado as any,
        observaciones: data.observaciones,
        fecha: new Date()
      }, { transaction });

      // Create detalles
      const detallesCreados = await Promise.all(
        data.detalles.map(detalle => 
          DetallePedido.create({
            pedidoId: pedido.id,
            productoId: detalle.productoId,
            cantidad: detalle.cantidad,
            precioUnitario: detalle.precioUnitario,
            subtotal: detalle.subtotal
          }, { transaction })
        )
      );

      await transaction.commit();
      
      Logger.info(`Pedido created with transaction: ${pedido.id} with ${detallesCreados.length} detalles`);
      
      return {
        ...pedido.toJSON(),
        detalles: detallesCreados
      } as PedidoWithDetails;
    } catch (error) {
      await transaction.rollback();
      Logger.error('Error creating pedido with detalles:', error);
      throw error;
    }
  }

  /**
   * Get pedidos by estado with pagination
   */
  async findByEstado(estado: string, page: number = 1, limit: number = 10): Promise<{
    pedidos: PedidoWithDetails[];
    pagination: {
      page: number;
      limit: number;
      total: number;
      totalPages: number;
    };
  }> {
    try {
      const offset = (page - 1) * limit;
      
      const total = await Pedido.count({ where: { estado } });
      
      const pedidos = await Pedido.findAll({
        where: { estado },
        order: [['fecha', 'DESC']],
        limit,
        offset
      });

      // Get detalles for all pedidos
      const pedidoIds = pedidos.map(p => p.id);
      const allDetalles = await DetallePedido.findAll({
        where: { pedidoId: { [Op.in]: pedidoIds } }
      });

      // Group detalles by pedidoId
      const detallesByPedido: { [key: number]: DetallePedido[] } = {};
      allDetalles.forEach(detalle => {
        if (!detallesByPedido[detalle.pedidoId]) {
          detallesByPedido[detalle.pedidoId] = [];
        }
        detallesByPedido[detalle.pedidoId].push(detalle);
      });

      // Combine pedidos with their detalles
      const pedidosWithDetails = pedidos.map(pedido => ({
        ...pedido.toJSON(),
        detalles: detallesByPedido[pedido.id] || []
      })) as PedidoWithDetails[];

      const totalPages = Math.ceil(total / limit);

      return {
        pedidos: pedidosWithDetails,
        pagination: { page, limit, total, totalPages }
      };
    } catch (error) {
      Logger.error('Error finding pedidos by estado:', error);
      throw error;
    }
  }

  /**
   * Get recent pedidos (last 30 days)
   */
  async getRecentPedidos(limit: number = 10): Promise<PedidoWithDetails[]> {
    try {
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

      const pedidos = await Pedido.findAll({
        where: {
          fecha: {
            [Op.gte]: thirtyDaysAgo
          }
        },
        order: [['fecha', 'DESC']],
        limit
      });

      // Get detalles for all pedidos
      const pedidoIds = pedidos.map(p => p.id);
      const allDetalles = await DetallePedido.findAll({
        where: { pedidoId: { [Op.in]: pedidoIds } }
      });

      // Group detalles by pedidoId
      const detallesByPedido: { [key: number]: DetallePedido[] } = {};
      allDetalles.forEach(detalle => {
        if (!detallesByPedido[detalle.pedidoId]) {
          detallesByPedido[detalle.pedidoId] = [];
        }
        detallesByPedido[detalle.pedidoId].push(detalle);
      });

      // Combine pedidos with their detalles
      const pedidosWithDetails = pedidos.map(pedido => ({
        ...pedido.toJSON(),
        detalles: detallesByPedido[pedido.id] || []
      })) as PedidoWithDetails[];

      return pedidosWithDetails;
    } catch (error) {
      Logger.error('Error getting recent pedidos:', error);
      throw error;
    }
  }

  /**
   * Get pedidos summary for dashboard
   */
  async getPedidosSummary(): Promise<{
    totalPedidos: number;
    pedidosHoy: number;
    pedidosEstaSemana: number;
    pedidosEsteMes: number;
    ventasTotales: number;
    ventasHoy: number;
    ventasEstaSemana: number;
    ventasEsteMes: number;
  }> {
    try {
      const hoy = new Date();
      hoy.setHours(0, 0, 0, 0);
      
      const inicioSemana = new Date(hoy);
      inicioSemana.setDate(hoy.getDate() - hoy.getDay());
      
      const inicioMes = new Date(hoy.getFullYear(), hoy.getMonth(), 1);

      const [
        totalPedidos,
        pedidosHoy,
        pedidosEstaSemana,
        pedidosEsteMes,
        ventasTotales,
        ventasHoy,
        ventasEstaSemana,
        ventasEsteMes
      ] = await Promise.all([
        Pedido.count(),
        Pedido.count({ where: { fecha: { [Op.gte]: hoy } } }),
        Pedido.count({ where: { fecha: { [Op.gte]: inicioSemana } } }),
        Pedido.count({ where: { fecha: { [Op.gte]: inicioMes } } }),
        Pedido.findOne({
          attributes: [[Pedido.sequelize!.fn('SUM', Pedido.sequelize!.col('total')), 'total']]
        }),
        Pedido.findOne({
          attributes: [[Pedido.sequelize!.fn('SUM', Pedido.sequelize!.col('total')), 'total']],
          where: { fecha: { [Op.gte]: hoy } }
        }),
        Pedido.findOne({
          attributes: [[Pedido.sequelize!.fn('SUM', Pedido.sequelize!.col('total')), 'total']],
          where: { fecha: { [Op.gte]: inicioSemana } }
        }),
        Pedido.findOne({
          attributes: [[Pedido.sequelize!.fn('SUM', Pedido.sequelize!.col('total')), 'total']],
          where: { fecha: { [Op.gte]: inicioMes } }
        })
      ]);

      return {
        totalPedidos,
        pedidosHoy,
        pedidosEstaSemana,
        pedidosEsteMes,
        ventasTotales: parseFloat((ventasTotales as any)?.dataValues?.total || '0'),
        ventasHoy: parseFloat((ventasHoy as any)?.dataValues?.total || '0'),
        ventasEstaSemana: parseFloat((ventasEstaSemana as any)?.dataValues?.total || '0'),
        ventasEsteMes: parseFloat((ventasEsteMes as any)?.dataValues?.total || '0')
      };
    } catch (error) {
      Logger.error('Error getting pedidos summary:', error);
      throw error;
    }
  }
}
