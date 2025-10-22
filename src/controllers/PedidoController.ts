import { Request, Response } from 'express';
import { PedidoDAO } from '../dao/PedidoDAO';
import { ProductoDAO } from '../dao/ProductoDAO';
import { ClienteDAO } from '../dao/ClienteDAO';
import { ResponseHelper } from '../utils/helpers';
import { ValidationMiddleware } from '../middlewares/ValidationMiddleware';
import { orderSchemas } from '../dto/validationSchemas';

export class PedidoController {
  private pedidoDAO: PedidoDAO;
  private productoDAO: ProductoDAO;
  private clienteDAO: ClienteDAO;

  constructor() {
    this.pedidoDAO = new PedidoDAO();
    this.productoDAO = new ProductoDAO();
    this.clienteDAO = new ClienteDAO();
  }

  /**
   * Create new pedido with stock validation
   */
  public createPedido = async (req: Request, res: Response): Promise<void> => {
    try {
      const pedidoData = req.body;
      const usuarioId = (req as any).user?.id;

      if (!usuarioId) {
        ResponseHelper.error(res, 'User not authenticated', 401);
        return;
      }

      // Validate cliente exists
      const cliente = await this.clienteDAO.findById(pedidoData.clienteId);
      if (!cliente || !cliente.activo) {
        ResponseHelper.error(res, 'Cliente not found or inactive', 404);
        return;
      }

      // Validate productos and check stock
      const productos = [];
      const stockUpdates = [];

      for (const item of pedidoData.productos) {
        const producto = await this.productoDAO.findById(item.productoId);
        
        if (!producto || !producto.activo) {
          ResponseHelper.error(res, `Producto ${item.productoId} not found or inactive`, 404);
          return;
        }

        if (producto.stock < item.cantidad) {
          ResponseHelper.error(res, `Insufficient stock for producto ${producto.nombre}. Available: ${producto.stock}, Requested: ${item.cantidad}`, 400);
          return;
        }

        productos.push({
          productoId: item.productoId,
          cantidad: item.cantidad,
          precioUnitario: parseFloat(producto.precio.toString())
        });

        stockUpdates.push({
          productoId: item.productoId,
          cantidad: item.cantidad,
          operacion: 'subtract'
        });
      }

      // Create pedido with detalles
      const pedido = await this.pedidoDAO.create({
        clienteId: pedidoData.clienteId,
        usuarioId,
        fecha: new Date(),
        estado: 'pendiente',
        observaciones: pedidoData.observaciones,
        detalles: productos
      });

      // Update stock for all productos
      for (const update of stockUpdates) {
        await this.productoDAO.updateStock(update.productoId, update.cantidad, update.operacion);
      }

      ResponseHelper.success(res, pedido, 'Pedido created successfully', 201);

    } catch (error) {
      ResponseHelper.error(res, 'Error creating pedido', 500, error);
    }
  };

  /**
   * Get all pedidos with filters and pagination
   */
  public getAllPedidos = async (req: Request, res: Response): Promise<void> => {
    try {
      const filters = {
        clienteId: req.query.clienteId ? parseInt(req.query.clienteId as string) : undefined,
        usuarioId: req.query.usuarioId ? parseInt(req.query.usuarioId as string) : undefined,
        estado: req.query.estado as 'pendiente' | 'confirmado' | 'enviado' | 'entregado' | 'cancelado' | undefined,
        fechaInicio: req.query.fechaInicio ? new Date(req.query.fechaInicio as string) : undefined,
        fechaFin: req.query.fechaFin ? new Date(req.query.fechaFin as string) : undefined,
        productoId: req.query.productoId ? parseInt(req.query.productoId as string) : undefined
      };

      const pagination = {
        page: parseInt(req.query.page as string) || 1,
        limit: parseInt(req.query.limit as string) || 10
      };

      const result = await this.pedidoDAO.findAll({
        filters,
        pagination,
        order: [['createdAt', 'DESC']],
        includeDetails: true
      });

      ResponseHelper.success(res, {
        pedidos: result.pedidos,
        pagination: {
          page: result.page,
          limit: result.limit,
          total: result.total,
          totalPages: result.totalPages
        }
      }, 'Pedidos retrieved successfully');

    } catch (error) {
      ResponseHelper.error(res, 'Error retrieving pedidos', 500, error);
    }
  };

  /**
   * Get pedido by ID with detalles
   */
  public getPedidoById = async (req: Request, res: Response): Promise<void> => {
    try {
      const id = parseInt(req.params.id);
      
      const pedido = await this.pedidoDAO.findById(id);
      
      if (!pedido) {
        ResponseHelper.error(res, 'Pedido not found', 404);
        return;
      }

      ResponseHelper.success(res, pedido, 'Pedido retrieved successfully');

    } catch (error) {
      ResponseHelper.error(res, 'Error retrieving pedido', 500, error);
    }
  };

  /**
   * Update pedido estado
   */
  public updatePedidoEstado = async (req: Request, res: Response): Promise<void> => {
    try {
      const id = parseInt(req.params.id);
      const { estado } = req.body;

      if (!['pendiente', 'confirmado', 'enviado', 'entregado', 'cancelado'].includes(estado)) {
        ResponseHelper.validationError(res, 'Invalid estado. Must be: pendiente, confirmado, enviado, entregado, or cancelado');
        return;
      }

      const pedido = await this.pedidoDAO.updateEstado(id, estado);
      
      if (!pedido) {
        ResponseHelper.error(res, 'Pedido not found', 404);
        return;
      }

      ResponseHelper.success(res, pedido, 'Pedido estado updated successfully');

    } catch (error) {
      ResponseHelper.error(res, 'Error updating pedido estado', 500, error);
    }
  };

  /**
   * Get pedidos by cliente
   */
  public getPedidosByCliente = async (req: Request, res: Response): Promise<void> => {
    try {
      const clienteId = parseInt(req.params.clienteId);
      
      // Validate cliente exists
      const cliente = await this.clienteDAO.findById(clienteId);
      if (!cliente) {
        ResponseHelper.error(res, 'Cliente not found', 404);
        return;
      }

      const pedidos = await this.pedidoDAO.findByCliente(clienteId, true);

      ResponseHelper.success(res, {
        pedidos,
        cliente: {
          id: cliente.id,
          nombre: cliente.nombre,
          email: cliente.email
        }
      }, 'Pedidos by cliente retrieved successfully');

    } catch (error) {
      ResponseHelper.error(res, 'Error retrieving pedidos by cliente', 500, error);
    }
  };

  /**
   * Get pedidos by producto
   */
  public getPedidosByProducto = async (req: Request, res: Response): Promise<void> => {
    try {
      const productoId = parseInt(req.params.productoId);
      
      // Validate producto exists
      const producto = await this.productoDAO.findById(productoId);
      if (!producto) {
        ResponseHelper.error(res, 'Producto not found', 404);
        return;
      }

      const pedidos = await this.pedidoDAO.findByProducto(productoId);

      ResponseHelper.success(res, {
        pedidos,
        producto: {
          id: producto.id,
          codigo: producto.codigo,
          nombre: producto.nombre,
          precio: producto.precio
        }
      }, 'Pedidos by producto retrieved successfully');

    } catch (error) {
      ResponseHelper.error(res, 'Error retrieving pedidos by producto', 500, error);
    }
  };

  /**
   * Get pedidos by date range
   */
  public getPedidosByDateRange = async (req: Request, res: Response): Promise<void> => {
    try {
      const fechaInicio = new Date(req.query.fechaInicio as string);
      const fechaFin = new Date(req.query.fechaFin as string);

      if (isNaN(fechaInicio.getTime()) || isNaN(fechaFin.getTime())) {
        ResponseHelper.validationError(res, 'Invalid date format');
        return;
      }

      if (fechaInicio > fechaFin) {
        ResponseHelper.validationError(res, 'Start date must be before end date');
        return;
      }

      const pedidos = await this.pedidoDAO.findByDateRange(fechaInicio, fechaFin);

      ResponseHelper.success(res, {
        pedidos,
        fechaInicio: fechaInicio.toISOString(),
        fechaFin: fechaFin.toISOString(),
        total: pedidos.length
      }, 'Pedidos by date range retrieved successfully');

    } catch (error) {
      ResponseHelper.error(res, 'Error retrieving pedidos by date range', 500, error);
    }
  };

  /**
   * Get pedido statistics
   */
  public getPedidoStatistics = async (req: Request, res: Response): Promise<void> => {
    try {
      const statistics = await this.pedidoDAO.getStatistics();
      
      ResponseHelper.success(res, statistics, 'Pedido statistics retrieved successfully');

    } catch (error) {
      ResponseHelper.error(res, 'Error retrieving pedido statistics', 500, error);
    }
  };

  /**
   * Cancel pedido and restore stock
   */
  public cancelPedido = async (req: Request, res: Response): Promise<void> => {
    try {
      const id = parseInt(req.params.id);
      
      const pedido = await this.pedidoDAO.findById(id);
      
      if (!pedido) {
        ResponseHelper.error(res, 'Pedido not found', 404);
        return;
      }

      if (pedido.estado === 'cancelado') {
        ResponseHelper.error(res, 'Pedido is already cancelled', 400);
        return;
      }

      if (pedido.estado === 'entregado') {
        ResponseHelper.error(res, 'Cannot cancel delivered pedido', 400);
        return;
      }

      // Restore stock for all productos
      for (const detalle of pedido.detalles) {
        await this.productoDAO.updateStock(detalle.productoId, detalle.cantidad, 'add');
      }

      // Update pedido estado
      const updatedPedido = await this.pedidoDAO.updateEstado(id, 'cancelado');

      ResponseHelper.success(res, updatedPedido, 'Pedido cancelled and stock restored successfully');

    } catch (error) {
      ResponseHelper.error(res, 'Error cancelling pedido', 500, error);
    }
  };
}
