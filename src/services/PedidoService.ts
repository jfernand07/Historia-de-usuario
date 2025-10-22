import { PedidoDAO } from '../dao/PedidoDAO';
import { ProductoDAO } from '../dao/ProductoDAO';
import { ClienteDAO } from '../dao/ClienteDAO';
import { UsuarioDAO } from '../dao/UsuarioDAO';
import { Pedido, DetallePedido, Producto, Cliente, Usuario } from '../models';
import { Logger } from '../utils/helpers';
import { HybridEncryptionService } from './HybridEncryptionService';

export interface PedidoCreateData {
  clienteId: number;
  productos: Array<{
    productoId: number;
    cantidad: number;
  }>;
  observaciones?: string;
}

export interface PedidoFilters {
  clienteId?: number;
  usuarioId?: number;
  estado?: string;
  fechaInicio?: string;
  fechaFin?: string;
  productoId?: number;
  page?: number;
  limit?: number;
}

export interface PedidoStatistics {
  totalPedidos: number;
  pedidosPorEstado: Record<string, number>;
  ventasTotales: number;
  promedioPedido: number;
  pedidosUltimoMes: number;
}

export class PedidoService {
  private pedidoDAO: PedidoDAO;
  private productoDAO: ProductoDAO;
  private clienteDAO: ClienteDAO;
  private usuarioDAO: UsuarioDAO;
  private encryptionService: HybridEncryptionService;

  constructor() {
    this.pedidoDAO = new PedidoDAO();
    this.productoDAO = new ProductoDAO();
    this.clienteDAO = new ClienteDAO();
    this.usuarioDAO = new UsuarioDAO();
    this.encryptionService = new HybridEncryptionService();
  }

  /**
   * Create a new pedido with stock validation and automatic inventory reduction
   */
  async createPedido(data: PedidoCreateData, usuarioId: number): Promise<Pedido> {
    try {
      Logger.info('Creating new pedido', { clienteId: data.clienteId, usuarioId });

      // Validate cliente exists
      const cliente = await this.clienteDAO.findById(data.clienteId);
      if (!cliente) {
        throw new Error('Cliente not found');
      }

      // Validate usuario exists
      const usuario = await this.usuarioDAO.findById(usuarioId);
      if (!usuario) {
        throw new Error('Usuario not found');
      }

      // Validate productos and check stock
      const productos = await this.validateProductosAndStock(data.productos);

      // Calculate total
      let total = 0;
      const detalles: Array<{
        productoId: number;
        cantidad: number;
        precioUnitario: number;
        subtotal: number;
      }> = [];

      for (const item of data.productos) {
        const producto = productos.find(p => p.id === item.productoId);
        if (!producto) {
          throw new Error(`Producto ${item.productoId} not found`);
        }

        const subtotal = producto.precio * item.cantidad;
        total += subtotal;

        detalles.push({
          productoId: item.productoId,
          cantidad: item.cantidad,
          precioUnitario: producto.precio,
          subtotal
        });
      }

      // Create pedido with transaction
      const pedido = await this.pedidoDAO.createWithDetalles({
        clienteId: data.clienteId,
        usuarioId,
        total,
        estado: 'pendiente',
        observaciones: data.observaciones,
        detalles
      });

      // Reduce stock for each producto
      await this.reduceStock(data.productos);

      Logger.info('Pedido created successfully', { pedidoId: pedido.id });
      return pedido;

    } catch (error) {
      Logger.error('Error creating pedido', error);
      throw error;
    }
  }

  /**
   * Get all pedidos with filters and pagination
   */
  async getAllPedidos(filters: PedidoFilters): Promise<{
    pedidos: Pedido[];
    pagination: {
      page: number;
      limit: number;
      total: number;
      totalPages: number;
    };
  }> {
    try {
      Logger.info('Getting all pedidos with filters', filters);

      const result = await this.pedidoDAO.findAllWithFilters(filters);
      
      Logger.info('Pedidos retrieved successfully', { 
        count: result.pedidos.length,
        total: result.pagination.total 
      });

      return result;
    } catch (error) {
      Logger.error('Error getting pedidos', error);
      throw error;
    }
  }

  /**
   * Get pedido by ID with detalles
   */
  async getPedidoById(id: number): Promise<Pedido | null> {
    try {
      Logger.info('Getting pedido by ID', { id });

      const pedido = await this.pedidoDAO.findByIdWithDetalles(id);
      
      if (!pedido) {
        Logger.warn('Pedido not found', { id });
        return null;
      }

      Logger.info('Pedido retrieved successfully', { id });
      return pedido;
    } catch (error) {
      Logger.error('Error getting pedido by ID', error);
      throw error;
    }
  }

  /**
   * Update pedido estado
   */
  async updatePedidoEstado(id: number, estado: string): Promise<Pedido | null> {
    try {
      Logger.info('Updating pedido estado', { id, estado });

      const pedido = await this.pedidoDAO.findById(id);
      if (!pedido) {
        throw new Error('Pedido not found');
      }

      // Validate estado transition
      this.validateEstadoTransition(pedido.estado, estado);

      const updatedPedido = await this.pedidoDAO.update(id, { estado });
      
      Logger.info('Pedido estado updated successfully', { id, estado });
      return updatedPedido;
    } catch (error) {
      Logger.error('Error updating pedido estado', error);
      throw error;
    }
  }

  /**
   * Get pedidos by cliente
   */
  async getPedidosByCliente(clienteId: number): Promise<Pedido[]> {
    try {
      Logger.info('Getting pedidos by cliente', { clienteId });

      // Validate cliente exists
      const cliente = await this.clienteDAO.findById(clienteId);
      if (!cliente) {
        throw new Error('Cliente not found');
      }

      const pedidos = await this.pedidoDAO.findByCliente(clienteId);
      
      Logger.info('Pedidos by cliente retrieved successfully', { 
        clienteId, 
        count: pedidos.length 
      });

      return pedidos;
    } catch (error) {
      Logger.error('Error getting pedidos by cliente', error);
      throw error;
    }
  }

  /**
   * Get pedidos by producto
   */
  async getPedidosByProducto(productoId: number): Promise<Pedido[]> {
    try {
      Logger.info('Getting pedidos by producto', { productoId });

      // Validate producto exists
      const producto = await this.productoDAO.findById(productoId);
      if (!producto) {
        throw new Error('Producto not found');
      }

      const pedidos = await this.pedidoDAO.findByProducto(productoId);
      
      Logger.info('Pedidos by producto retrieved successfully', { 
        productoId, 
        count: pedidos.length 
      });

      return pedidos;
    } catch (error) {
      Logger.error('Error getting pedidos by producto', error);
      throw error;
    }
  }

  /**
   * Get pedidos by date range
   */
  async getPedidosByDateRange(fechaInicio: string, fechaFin: string): Promise<Pedido[]> {
    try {
      Logger.info('Getting pedidos by date range', { fechaInicio, fechaFin });

      const pedidos = await this.pedidoDAO.findByDateRange(fechaInicio, fechaFin);
      
      Logger.info('Pedidos by date range retrieved successfully', { 
        fechaInicio, 
        fechaFin, 
        count: pedidos.length 
      });

      return pedidos;
    } catch (error) {
      Logger.error('Error getting pedidos by date range', error);
      throw error;
    }
  }

  /**
   * Get pedido statistics
   */
  async getPedidoStatistics(): Promise<PedidoStatistics> {
    try {
      Logger.info('Getting pedido statistics');

      const statistics = await this.pedidoDAO.getStatistics();
      
      Logger.info('Pedido statistics retrieved successfully');
      return statistics;
    } catch (error) {
      Logger.error('Error getting pedido statistics', error);
      throw error;
    }
  }

  /**
   * Cancel pedido and restore stock
   */
  async cancelPedido(id: number): Promise<Pedido | null> {
    try {
      Logger.info('Cancelling pedido', { id });

      const pedido = await this.pedidoDAO.findByIdWithDetalles(id);
      if (!pedido) {
        throw new Error('Pedido not found');
      }

      // Check if pedido can be cancelled
      if (pedido.estado === 'entregado') {
        throw new Error('Cannot cancel delivered pedido');
      }

      if (pedido.estado === 'cancelado') {
        throw new Error('Pedido is already cancelled');
      }

      // Update estado to cancelled
      const updatedPedido = await this.pedidoDAO.update(id, { estado: 'cancelado' });

      // Restore stock
      if (pedido.detalles && pedido.detalles.length > 0) {
        await this.restoreStock(pedido.detalles);
      }

      Logger.info('Pedido cancelled and stock restored successfully', { id });
      return updatedPedido;
    } catch (error) {
      Logger.error('Error cancelling pedido', error);
      throw error;
    }
  }

  /**
   * Validate productos and check stock availability
   */
  private async validateProductosAndStock(productos: Array<{ productoId: number; cantidad: number }>): Promise<Producto[]> {
    const productoIds = productos.map(p => p.productoId);
    const productosData = await this.productoDAO.findByIds(productoIds);

    if (productosData.length !== productoIds.length) {
      throw new Error('Some productos not found');
    }

    // Check stock for each producto
    for (const item of productos) {
      const producto = productosData.find(p => p.id === item.productoId);
      if (!producto) {
        throw new Error(`Producto ${item.productoId} not found`);
      }

      if (producto.stock < item.cantidad) {
        throw new Error(`Insufficient stock for producto ${producto.nombre}. Available: ${producto.stock}, Required: ${item.cantidad}`);
      }
    }

    return productosData;
  }

  /**
   * Reduce stock for productos
   */
  private async reduceStock(productos: Array<{ productoId: number; cantidad: number }>): Promise<void> {
    for (const item of productos) {
      await this.productoDAO.reduceStock(item.productoId, item.cantidad);
    }
  }

  /**
   * Restore stock for productos
   */
  private async restoreStock(detalles: DetallePedido[]): Promise<void> {
    for (const detalle of detalles) {
      await this.productoDAO.increaseStock(detalle.productoId, detalle.cantidad);
    }
  }

  /**
   * Validate estado transition
   */
  private validateEstadoTransition(currentEstado: string, newEstado: string): void {
    const validTransitions: Record<string, string[]> = {
      'pendiente': ['confirmado', 'cancelado'],
      'confirmado': ['enviado', 'cancelado'],
      'enviado': ['entregado'],
      'entregado': [], // No transitions from entregado
      'cancelado': [] // No transitions from cancelado
    };

    if (!validTransitions[currentEstado]?.includes(newEstado)) {
      throw new Error(`Invalid estado transition from ${currentEstado} to ${newEstado}`);
    }
  }

  /**
   * Encrypt sensitive pedido data
   */
  async encryptPedidoData(pedido: Pedido): Promise<string> {
    try {
      const sensitiveData = {
        observaciones: pedido.observaciones,
        detalles: pedido.detalles?.map(d => ({
          cantidad: d.cantidad,
          precioUnitario: d.precioUnitario,
          subtotal: d.subtotal
        }))
      };

      return await this.encryptionService.encrypt(JSON.stringify(sensitiveData));
    } catch (error) {
      Logger.error('Error encrypting pedido data', error);
      throw error;
    }
  }

  /**
   * Decrypt sensitive pedido data
   */
  async decryptPedidoData(encryptedData: string): Promise<any> {
    try {
      const decryptedData = await this.encryptionService.decrypt(encryptedData);
      return JSON.parse(decryptedData);
    } catch (error) {
      Logger.error('Error decrypting pedido data', error);
      throw error;
    }
  }
}
