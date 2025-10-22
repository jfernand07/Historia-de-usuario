import { PedidoService } from '../../src/services/PedidoService';
import { PedidoDAO } from '../../src/dao/PedidoDAO';
import { ProductoDAO } from '../../src/dao/ProductoDAO';
import { ClienteDAO } from '../../src/dao/ClienteDAO';
import { UsuarioDAO } from '../../src/dao/UsuarioDAO';
import { HybridEncryptionService } from '../../src/services/HybridEncryptionService';

// Mock dependencies
jest.mock('../../src/dao/PedidoDAO');
jest.mock('../../src/dao/ProductoDAO');
jest.mock('../../src/dao/ClienteDAO');
jest.mock('../../src/dao/UsuarioDAO');
jest.mock('../../src/services/HybridEncryptionService');

describe('PedidoService', () => {
  let pedidoService: PedidoService;
  let mockPedidoDAO: jest.Mocked<PedidoDAO>;
  let mockProductoDAO: jest.Mocked<ProductoDAO>;
  let mockClienteDAO: jest.Mocked<ClienteDAO>;
  let mockUsuarioDAO: jest.Mocked<UsuarioDAO>;
  let mockEncryptionService: jest.Mocked<HybridEncryptionService>;

  beforeEach(() => {
    pedidoService = new PedidoService();
    mockPedidoDAO = new PedidoDAO() as jest.Mocked<PedidoDAO>;
    mockProductoDAO = new ProductoDAO() as jest.Mocked<ProductoDAO>;
    mockClienteDAO = new ClienteDAO() as jest.Mocked<ClienteDAO>;
    mockUsuarioDAO = new UsuarioDAO() as jest.Mocked<UsuarioDAO>;
    mockEncryptionService = new HybridEncryptionService() as jest.Mocked<HybridEncryptionService>;
    
    jest.clearAllMocks();
  });

  describe('createPedido', () => {
    it('should create pedido successfully with stock validation', async () => {
      // Arrange
      const pedidoData = {
        clienteId: 1,
        productos: [
          { productoId: 1, cantidad: 2 },
          { productoId: 2, cantidad: 1 }
        ],
        observaciones: 'Pedido urgente'
      };

      const usuarioId = 1;

      const mockCliente = {
        id: 1,
        nombre: 'Cliente Test',
        activo: true
      };

      const mockUsuario = {
        id: 1,
        nombre: 'Usuario Test',
        activo: true
      };

      const mockProductos = [
        {
          id: 1,
          nombre: 'Producto 1',
          precio: 89.99,
          stock: 50,
          activo: true
        },
        {
          id: 2,
          nombre: 'Producto 2',
          precio: 120.00,
          stock: 30,
          activo: true
        }
      ];

      const mockCreatedPedido = {
        id: 1,
        clienteId: 1,
        usuarioId: 1,
        total: 299.98,
        estado: 'pendiente',
        observaciones: 'Pedido urgente',
        fecha: new Date(),
        detalles: [
          {
            productoId: 1,
            cantidad: 2,
            precioUnitario: 89.99,
            subtotal: 179.98
          },
          {
            productoId: 2,
            cantidad: 1,
            precioUnitario: 120.00,
            subtotal: 120.00
          }
        ]
      };

      mockClienteDAO.findById = jest.fn().mockResolvedValue(mockCliente);
      mockUsuarioDAO.findById = jest.fn().mockResolvedValue(mockUsuario);
      mockProductoDAO.findByIds = jest.fn().mockResolvedValue(mockProductos);
      mockPedidoDAO.createWithDetalles = jest.fn().mockResolvedValue(mockCreatedPedido);
      mockProductoDAO.reduceStock = jest.fn().mockResolvedValue(null);

      // Act
      const result = await pedidoService.createPedido(pedidoData, usuarioId);

      // Assert
      expect(mockClienteDAO.findById).toHaveBeenCalledWith(1);
      expect(mockUsuarioDAO.findById).toHaveBeenCalledWith(1);
      expect(mockProductoDAO.findByIds).toHaveBeenCalledWith([1, 2]);
      expect(mockPedidoDAO.createWithDetalles).toHaveBeenCalledWith({
        clienteId: 1,
        usuarioId: 1,
        total: 299.98,
        estado: 'pendiente',
        observaciones: 'Pedido urgente',
        detalles: [
          {
            productoId: 1,
            cantidad: 2,
            precioUnitario: 89.99,
            subtotal: 179.98
          },
          {
            productoId: 2,
            cantidad: 1,
            precioUnitario: 120.00,
            subtotal: 120.00
          }
        ]
      });
      expect(mockProductoDAO.reduceStock).toHaveBeenCalledTimes(2);
      expect(result).toEqual(mockCreatedPedido);
    });

    it('should throw error for non-existent cliente', async () => {
      // Arrange
      const pedidoData = {
        clienteId: 999,
        productos: [{ productoId: 1, cantidad: 2 }],
        observaciones: 'Pedido urgente'
      };

      const usuarioId = 1;

      mockClienteDAO.findById = jest.fn().mockResolvedValue(null);

      // Act & Assert
      await expect(pedidoService.createPedido(pedidoData, usuarioId))
        .rejects.toThrow('Cliente not found');
    });

    it('should throw error for insufficient stock', async () => {
      // Arrange
      const pedidoData = {
        clienteId: 1,
        productos: [{ productoId: 1, cantidad: 100 }], // More than available stock
        observaciones: 'Pedido urgente'
      };

      const usuarioId = 1;

      const mockCliente = { id: 1, nombre: 'Cliente Test', activo: true };
      const mockUsuario = { id: 1, nombre: 'Usuario Test', activo: true };
      const mockProducto = {
        id: 1,
        nombre: 'Producto 1',
        precio: 89.99,
        stock: 50, // Less than requested quantity
        activo: true
      };

      mockClienteDAO.findById = jest.fn().mockResolvedValue(mockCliente);
      mockUsuarioDAO.findById = jest.fn().mockResolvedValue(mockUsuario);
      mockProductoDAO.findByIds = jest.fn().mockResolvedValue([mockProducto]);

      // Act & Assert
      await expect(pedidoService.createPedido(pedidoData, usuarioId))
        .rejects.toThrow('Insufficient stock for producto Producto 1. Available: 50, Required: 100');
    });

    it('should throw error for non-existent producto', async () => {
      // Arrange
      const pedidoData = {
        clienteId: 1,
        productos: [{ productoId: 999, cantidad: 2 }],
        observaciones: 'Pedido urgente'
      };

      const usuarioId = 1;

      const mockCliente = { id: 1, nombre: 'Cliente Test', activo: true };
      const mockUsuario = { id: 1, nombre: 'Usuario Test', activo: true };

      mockClienteDAO.findById = jest.fn().mockResolvedValue(mockCliente);
      mockUsuarioDAO.findById = jest.fn().mockResolvedValue(mockUsuario);
      mockProductoDAO.findByIds = jest.fn().mockResolvedValue([]);

      // Act & Assert
      await expect(pedidoService.createPedido(pedidoData, usuarioId))
        .rejects.toThrow('Some productos not found');
    });
  });

  describe('getAllPedidos', () => {
    it('should return pedidos with filters and pagination', async () => {
      // Arrange
      const filters = {
        clienteId: 1,
        estado: 'pendiente',
        page: 1,
        limit: 10
      };

      const mockPedidos = [
        {
          id: 1,
          clienteId: 1,
          usuarioId: 1,
          total: 299.98,
          estado: 'pendiente',
          fecha: new Date(),
          detalles: []
        }
      ];

      const mockResult = {
        pedidos: mockPedidos,
        pagination: {
          page: 1,
          limit: 10,
          total: 1,
          totalPages: 1
        }
      };

      mockPedidoDAO.findAllWithFilters = jest.fn().mockResolvedValue(mockResult);

      // Act
      const result = await pedidoService.getAllPedidos(filters);

      // Assert
      expect(mockPedidoDAO.findAllWithFilters).toHaveBeenCalledWith(filters);
      expect(result).toEqual(mockResult);
    });
  });

  describe('getPedidoById', () => {
    it('should return pedido by id with detalles', async () => {
      // Arrange
      const pedidoId = 1;
      const mockPedido = {
        id: 1,
        clienteId: 1,
        usuarioId: 1,
        total: 299.98,
        estado: 'pendiente',
        fecha: new Date(),
        detalles: [
          {
            productoId: 1,
            cantidad: 2,
            precioUnitario: 89.99,
            subtotal: 179.98
          }
        ]
      };

      mockPedidoDAO.findByIdWithDetalles = jest.fn().mockResolvedValue(mockPedido);

      // Act
      const result = await pedidoService.getPedidoById(pedidoId);

      // Assert
      expect(mockPedidoDAO.findByIdWithDetalles).toHaveBeenCalledWith(pedidoId);
      expect(result).toEqual(mockPedido);
    });

    it('should return null for non-existent pedido', async () => {
      // Arrange
      const pedidoId = 999;
      mockPedidoDAO.findByIdWithDetalles = jest.fn().mockResolvedValue(null);

      // Act
      const result = await pedidoService.getPedidoById(pedidoId);

      // Assert
      expect(mockPedidoDAO.findByIdWithDetalles).toHaveBeenCalledWith(pedidoId);
      expect(result).toBeNull();
    });
  });

  describe('updatePedidoEstado', () => {
    it('should update pedido estado successfully', async () => {
      // Arrange
      const pedidoId = 1;
      const newEstado = 'confirmado';
      const mockPedido = {
        id: 1,
        estado: 'pendiente',
        clienteId: 1,
        usuarioId: 1,
        total: 299.98
      };

      const mockUpdatedPedido = {
        ...mockPedido,
        estado: newEstado
      };

      mockPedidoDAO.findById = jest.fn().mockResolvedValue(mockPedido);
      mockPedidoDAO.update = jest.fn().mockResolvedValue(mockUpdatedPedido);

      // Act
      const result = await pedidoService.updatePedidoEstado(pedidoId, newEstado);

      // Assert
      expect(mockPedidoDAO.findById).toHaveBeenCalledWith(pedidoId);
      expect(mockPedidoDAO.update).toHaveBeenCalledWith(pedidoId, { estado: newEstado });
      expect(result).toEqual(mockUpdatedPedido);
    });

    it('should throw error for invalid estado transition', async () => {
      // Arrange
      const pedidoId = 1;
      const newEstado = 'entregado'; // Invalid transition from pendiente
      const mockPedido = {
        id: 1,
        estado: 'pendiente',
        clienteId: 1,
        usuarioId: 1,
        total: 299.98
      };

      mockPedidoDAO.findById = jest.fn().mockResolvedValue(mockPedido);

      // Act & Assert
      await expect(pedidoService.updatePedidoEstado(pedidoId, newEstado))
        .rejects.toThrow('Invalid estado transition from pendiente to entregado');
    });

    it('should throw error for non-existent pedido', async () => {
      // Arrange
      const pedidoId = 999;
      const newEstado = 'confirmado';

      mockPedidoDAO.findById = jest.fn().mockResolvedValue(null);

      // Act & Assert
      await expect(pedidoService.updatePedidoEstado(pedidoId, newEstado))
        .rejects.toThrow('Pedido not found');
    });
  });

  describe('cancelPedido', () => {
    it('should cancel pedido and restore stock successfully', async () => {
      // Arrange
      const pedidoId = 1;
      const mockPedido = {
        id: 1,
        estado: 'pendiente',
        clienteId: 1,
        usuarioId: 1,
        total: 299.98,
        detalles: [
          {
            productoId: 1,
            cantidad: 2
          },
          {
            productoId: 2,
            cantidad: 1
          }
        ]
      };

      const mockUpdatedPedido = {
        ...mockPedido,
        estado: 'cancelado'
      };

      mockPedidoDAO.findByIdWithDetalles = jest.fn().mockResolvedValue(mockPedido);
      mockPedidoDAO.update = jest.fn().mockResolvedValue(mockUpdatedPedido);
      mockProductoDAO.increaseStock = jest.fn().mockResolvedValue(null);

      // Act
      const result = await pedidoService.cancelPedido(pedidoId);

      // Assert
      expect(mockPedidoDAO.findByIdWithDetalles).toHaveBeenCalledWith(pedidoId);
      expect(mockPedidoDAO.update).toHaveBeenCalledWith(pedidoId, { estado: 'cancelado' });
      expect(mockProductoDAO.increaseStock).toHaveBeenCalledTimes(2);
      expect(result).toEqual(mockUpdatedPedido);
    });

    it('should throw error for already delivered pedido', async () => {
      // Arrange
      const pedidoId = 1;
      const mockPedido = {
        id: 1,
        estado: 'entregado',
        clienteId: 1,
        usuarioId: 1,
        total: 299.98,
        detalles: []
      };

      mockPedidoDAO.findByIdWithDetalles = jest.fn().mockResolvedValue(mockPedido);

      // Act & Assert
      await expect(pedidoService.cancelPedido(pedidoId))
        .rejects.toThrow('Cannot cancel delivered pedido');
    });

    it('should throw error for already cancelled pedido', async () => {
      // Arrange
      const pedidoId = 1;
      const mockPedido = {
        id: 1,
        estado: 'cancelado',
        clienteId: 1,
        usuarioId: 1,
        total: 299.98,
        detalles: []
      };

      mockPedidoDAO.findByIdWithDetalles = jest.fn().mockResolvedValue(mockPedido);

      // Act & Assert
      await expect(pedidoService.cancelPedido(pedidoId))
        .rejects.toThrow('Pedido is already cancelled');
    });
  });

  describe('getPedidosByCliente', () => {
    it('should return pedidos by cliente', async () => {
      // Arrange
      const clienteId = 1;
      const mockPedidos = [
        {
          id: 1,
          clienteId: 1,
          usuarioId: 1,
          total: 299.98,
          estado: 'pendiente',
          fecha: new Date(),
          detalles: []
        }
      ];

      const mockCliente = { id: 1, nombre: 'Cliente Test', activo: true };

      mockClienteDAO.findById = jest.fn().mockResolvedValue(mockCliente);
      mockPedidoDAO.findByCliente = jest.fn().mockResolvedValue(mockPedidos);

      // Act
      const result = await pedidoService.getPedidosByCliente(clienteId);

      // Assert
      expect(mockClienteDAO.findById).toHaveBeenCalledWith(clienteId);
      expect(mockPedidoDAO.findByCliente).toHaveBeenCalledWith(clienteId);
      expect(result).toEqual(mockPedidos);
    });

    it('should throw error for non-existent cliente', async () => {
      // Arrange
      const clienteId = 999;
      mockClienteDAO.findById = jest.fn().mockResolvedValue(null);

      // Act & Assert
      await expect(pedidoService.getPedidosByCliente(clienteId))
        .rejects.toThrow('Cliente not found');
    });
  });

  describe('getPedidosByProducto', () => {
    it('should return pedidos by producto', async () => {
      // Arrange
      const productoId = 1;
      const mockPedidos = [
        {
          id: 1,
          clienteId: 1,
          usuarioId: 1,
          total: 299.98,
          estado: 'pendiente',
          fecha: new Date(),
          detalles: []
        }
      ];

      const mockProducto = { id: 1, nombre: 'Producto Test', activo: true };

      mockProductoDAO.findById = jest.fn().mockResolvedValue(mockProducto);
      mockPedidoDAO.findByProducto = jest.fn().mockResolvedValue(mockPedidos);

      // Act
      const result = await pedidoService.getPedidosByProducto(productoId);

      // Assert
      expect(mockProductoDAO.findById).toHaveBeenCalledWith(productoId);
      expect(mockPedidoDAO.findByProducto).toHaveBeenCalledWith(productoId);
      expect(result).toEqual(mockPedidos);
    });

    it('should throw error for non-existent producto', async () => {
      // Arrange
      const productoId = 999;
      mockProductoDAO.findById = jest.fn().mockResolvedValue(null);

      // Act & Assert
      await expect(pedidoService.getPedidosByProducto(productoId))
        .rejects.toThrow('Producto not found');
    });
  });

  describe('getPedidoStatistics', () => {
    it('should return pedido statistics', async () => {
      // Arrange
      const mockStatistics = {
        totalPedidos: 100,
        pedidosPorEstado: {
          pendiente: 10,
          confirmado: 20,
          enviado: 15,
          entregado: 50,
          cancelado: 5
        },
        ventasTotales: 50000,
        promedioPedido: 500,
        pedidosUltimoMes: 25
      };

      mockPedidoDAO.getStatistics = jest.fn().mockResolvedValue(mockStatistics);

      // Act
      const result = await pedidoService.getPedidoStatistics();

      // Assert
      expect(mockPedidoDAO.getStatistics).toHaveBeenCalled();
      expect(result).toEqual(mockStatistics);
    });
  });

  describe('encryptPedidoData', () => {
    it('should encrypt pedido data successfully', async () => {
      // Arrange
      const mockPedido = {
        id: 1,
        observaciones: 'Pedido urgente',
        detalles: [
          {
            cantidad: 2,
            precioUnitario: 89.99,
            subtotal: 179.98
          }
        ]
      };

      const mockEncryptedData = 'encrypted_data_string';
      mockEncryptionService.encrypt = jest.fn().mockResolvedValue(mockEncryptedData);

      // Act
      const result = await pedidoService.encryptPedidoData(mockPedido);

      // Assert
      expect(mockEncryptionService.encrypt).toHaveBeenCalled();
      expect(result).toBe(mockEncryptedData);
    });
  });

  describe('decryptPedidoData', () => {
    it('should decrypt pedido data successfully', async () => {
      // Arrange
      const encryptedData = 'encrypted_data_string';
      const mockDecryptedData = {
        observaciones: 'Pedido urgente',
        detalles: [
          {
            cantidad: 2,
            precioUnitario: 89.99,
            subtotal: 179.98
          }
        ]
      };

      mockEncryptionService.decrypt = jest.fn().mockResolvedValue(JSON.stringify(mockDecryptedData));

      // Act
      const result = await pedidoService.decryptPedidoData(encryptedData);

      // Assert
      expect(mockEncryptionService.decrypt).toHaveBeenCalledWith(encryptedData);
      expect(result).toEqual(mockDecryptedData);
    });
  });
});
