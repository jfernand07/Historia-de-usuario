import { Request, Response } from 'express';
import { ProductoController } from '../../src/controllers/ProductoController';
import { ProductoDAO } from '../../src/dao/ProductoDAO';
import { ResponseHelper } from '../../src/utils/helpers';

// Mock dependencies
jest.mock('../../src/dao/ProductoDAO');
jest.mock('../../src/utils/helpers');

describe('ProductoController', () => {
  let productoController: ProductoController;
  let mockProductoDAO: jest.Mocked<ProductoDAO>;
  let mockRequest: Partial<Request>;
  let mockResponse: Partial<Response>;

  beforeEach(() => {
    productoController = new ProductoController();
    mockProductoDAO = new ProductoDAO() as jest.Mocked<ProductoDAO>;
    
    mockRequest = {
      body: {},
      params: {},
      query: {},
      user: undefined
    };
    
    mockResponse = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis()
    };

    jest.clearAllMocks();
  });

  describe('createProducto', () => {
    it('should create producto successfully', async () => {
      // Arrange
      const productoData = {
        codigo: 'DEP-001',
        nombre: 'Balón de Fútbol',
        descripcion: 'Balón oficial de fútbol profesional',
        precio: 89.99,
        stock: 50,
        categoria: 'Fútbol'
      };

      const mockCreatedProducto = {
        id: 1,
        ...productoData,
        activo: true,
        createdAt: new Date(),
        updatedAt: new Date()
      };

      mockRequest.body = productoData;
      mockRequest.user = { id: 1, rol: 'admin' };
      
      mockProductoDAO.codeExists = jest.fn().mockResolvedValue(false);
      mockProductoDAO.create = jest.fn().mockResolvedValue(mockCreatedProducto);

      // Act
      await productoController.createProducto(mockRequest as Request, mockResponse as Response);

      // Assert
      expect(mockProductoDAO.codeExists).toHaveBeenCalledWith(productoData.codigo);
      expect(mockProductoDAO.create).toHaveBeenCalledWith(productoData);
      expect(ResponseHelper.success).toHaveBeenCalledWith(
        mockResponse,
        mockCreatedProducto,
        'Producto created successfully',
        201
      );
    });

    it('should return error for duplicate code', async () => {
      // Arrange
      const productoData = {
        codigo: 'DEP-001',
        nombre: 'Balón de Fútbol',
        descripcion: 'Balón oficial de fútbol profesional',
        precio: 89.99,
        stock: 50,
        categoria: 'Fútbol'
      };

      mockRequest.body = productoData;
      mockRequest.user = { id: 1, rol: 'admin' };
      
      mockProductoDAO.codeExists = jest.fn().mockResolvedValue(true);

      // Act
      await productoController.createProducto(mockRequest as Request, mockResponse as Response);

      // Assert
      expect(ResponseHelper.error).toHaveBeenCalledWith(
        mockResponse,
        'Product code already exists',
        400
      );
    });

    it('should return error for unauthorized user', async () => {
      // Arrange
      const productoData = {
        codigo: 'DEP-001',
        nombre: 'Balón de Fútbol',
        descripcion: 'Balón oficial de fútbol profesional',
        precio: 89.99,
        stock: 50,
        categoria: 'Fútbol'
      };

      mockRequest.body = productoData;
      mockRequest.user = { id: 2, rol: 'vendedor' };

      // Act
      await productoController.createProducto(mockRequest as Request, mockResponse as Response);

      // Assert
      expect(ResponseHelper.error).toHaveBeenCalledWith(
        mockResponse,
        'Insufficient permissions',
        403
      );
    });

    it('should handle service errors', async () => {
      // Arrange
      const productoData = {
        codigo: 'DEP-001',
        nombre: 'Balón de Fútbol',
        descripcion: 'Balón oficial de fútbol profesional',
        precio: 89.99,
        stock: 50,
        categoria: 'Fútbol'
      };

      mockRequest.body = productoData;
      mockRequest.user = { id: 1, rol: 'admin' };
      
      mockProductoDAO.codeExists = jest.fn().mockRejectedValue(new Error('Database error'));

      // Act
      await productoController.createProducto(mockRequest as Request, mockResponse as Response);

      // Assert
      expect(ResponseHelper.error).toHaveBeenCalledWith(
        mockResponse,
        'Error creating producto',
        500,
        expect.any(Error)
      );
    });
  });

  describe('getAllProductos', () => {
    it('should return productos with pagination', async () => {
      // Arrange
      const mockProductos = [
        {
          id: 1,
          codigo: 'DEP-001',
          nombre: 'Balón de Fútbol',
          precio: 89.99,
          stock: 50,
          categoria: 'Fútbol',
          activo: true
        },
        {
          id: 2,
          codigo: 'DEP-002',
          nombre: 'Raqueta de Tenis',
          precio: 120.00,
          stock: 30,
          categoria: 'Tenis',
          activo: true
        }
      ];

      const mockResult = {
        productos: mockProductos,
        total: 2,
        page: 1,
        limit: 10,
        totalPages: 1
      };

      mockRequest.query = { page: '1', limit: '10' };
      mockRequest.user = { id: 1, rol: 'admin' };
      
      mockProductoDAO.findAll = jest.fn().mockResolvedValue(mockResult);

      // Act
      await productoController.getAllProductos(mockRequest as Request, mockResponse as Response);

      // Assert
      expect(mockProductoDAO.findAll).toHaveBeenCalledWith({
        filters: {},
        pagination: { page: 1, limit: 10 },
        order: [['createdAt', 'DESC']]
      });
      expect(ResponseHelper.success).toHaveBeenCalledWith(
        mockResponse,
        mockResult,
        'Productos retrieved successfully'
      );
    });

    it('should apply filters correctly', async () => {
      // Arrange
      const mockResult = {
        productos: [],
        total: 0,
        page: 1,
        limit: 10,
        totalPages: 0
      };

      mockRequest.query = {
        categoria: 'Fútbol',
        activo: 'true',
        search: 'balón',
        page: '1',
        limit: '10'
      };
      mockRequest.user = { id: 1, rol: 'admin' };
      
      mockProductoDAO.findAll = jest.fn().mockResolvedValue(mockResult);

      // Act
      await productoController.getAllProductos(mockRequest as Request, mockResponse as Response);

      // Assert
      expect(mockProductoDAO.findAll).toHaveBeenCalledWith({
        filters: {
          categoria: 'Fútbol',
          activo: true,
          search: 'balón'
        },
        pagination: { page: 1, limit: 10 },
        order: [['createdAt', 'DESC']]
      });
    });
  });

  describe('getProductoById', () => {
    it('should return producto by id', async () => {
      // Arrange
      const mockProducto = {
        id: 1,
        codigo: 'DEP-001',
        nombre: 'Balón de Fútbol',
        descripcion: 'Balón oficial de fútbol profesional',
        precio: 89.99,
        stock: 50,
        categoria: 'Fútbol',
        activo: true,
        createdAt: new Date(),
        updatedAt: new Date()
      };

      mockRequest.params = { id: '1' };
      mockRequest.user = { id: 1, rol: 'admin' };
      
      mockProductoDAO.findById = jest.fn().mockResolvedValue(mockProducto);

      // Act
      await productoController.getProductoById(mockRequest as Request, mockResponse as Response);

      // Assert
      expect(mockProductoDAO.findById).toHaveBeenCalledWith(1);
      expect(ResponseHelper.success).toHaveBeenCalledWith(
        mockResponse,
        mockProducto,
        'Producto retrieved successfully'
      );
    });

    it('should return error for non-existent producto', async () => {
      // Arrange
      mockRequest.params = { id: '999' };
      mockRequest.user = { id: 1, rol: 'admin' };
      
      mockProductoDAO.findById = jest.fn().mockResolvedValue(null);

      // Act
      await productoController.getProductoById(mockRequest as Request, mockResponse as Response);

      // Assert
      expect(ResponseHelper.error).toHaveBeenCalledWith(
        mockResponse,
        'Producto not found',
        404
      );
    });

    it('should return error for invalid id', async () => {
      // Arrange
      mockRequest.params = { id: 'invalid' };
      mockRequest.user = { id: 1, rol: 'admin' };

      // Act
      await productoController.getProductoById(mockRequest as Request, mockResponse as Response);

      // Assert
      expect(ResponseHelper.badRequest).toHaveBeenCalledWith(
        mockResponse,
        'Invalid producto ID'
      );
    });
  });

  describe('updateProducto', () => {
    it('should update producto successfully', async () => {
      // Arrange
      const updateData = {
        nombre: 'Balón de Fútbol Actualizado',
        precio: 95.99,
        stock: 60
      };

      const mockUpdatedProducto = {
        id: 1,
        codigo: 'DEP-001',
        ...updateData,
        descripcion: 'Balón oficial de fútbol profesional',
        categoria: 'Fútbol',
        activo: true,
        createdAt: new Date(),
        updatedAt: new Date()
      };

      mockRequest.params = { id: '1' };
      mockRequest.body = updateData;
      mockRequest.user = { id: 1, rol: 'admin' };
      
      mockProductoDAO.findById = jest.fn().mockResolvedValue(mockUpdatedProducto);
      mockProductoDAO.update = jest.fn().mockResolvedValue(mockUpdatedProducto);

      // Act
      await productoController.updateProducto(mockRequest as Request, mockResponse as Response);

      // Assert
      expect(mockProductoDAO.update).toHaveBeenCalledWith(1, updateData);
      expect(ResponseHelper.success).toHaveBeenCalledWith(
        mockResponse,
        mockUpdatedProducto,
        'Producto updated successfully'
      );
    });

    it('should return error for non-existent producto', async () => {
      // Arrange
      const updateData = {
        nombre: 'Balón de Fútbol Actualizado'
      };

      mockRequest.params = { id: '999' };
      mockRequest.body = updateData;
      mockRequest.user = { id: 1, rol: 'admin' };
      
      mockProductoDAO.findById = jest.fn().mockResolvedValue(null);

      // Act
      await productoController.updateProducto(mockRequest as Request, mockResponse as Response);

      // Assert
      expect(ResponseHelper.error).toHaveBeenCalledWith(
        mockResponse,
        'Producto not found',
        404
      );
    });
  });

  describe('deleteProducto', () => {
    it('should delete producto successfully', async () => {
      // Arrange
      const mockProducto = {
        id: 1,
        codigo: 'DEP-001',
        nombre: 'Balón de Fútbol',
        activo: true
      };

      mockRequest.params = { id: '1' };
      mockRequest.user = { id: 1, rol: 'admin' };
      
      mockProductoDAO.findById = jest.fn().mockResolvedValue(mockProducto);
      mockProductoDAO.delete = jest.fn().mockResolvedValue(true);

      // Act
      await productoController.deleteProducto(mockRequest as Request, mockResponse as Response);

      // Assert
      expect(mockProductoDAO.delete).toHaveBeenCalledWith(1);
      expect(ResponseHelper.success).toHaveBeenCalledWith(
        mockResponse,
        { id: 1 },
        'Producto deleted successfully'
      );
    });

    it('should return error for non-existent producto', async () => {
      // Arrange
      mockRequest.params = { id: '999' };
      mockRequest.user = { id: 1, rol: 'admin' };
      
      mockProductoDAO.findById = jest.fn().mockResolvedValue(null);

      // Act
      await productoController.deleteProducto(mockRequest as Request, mockResponse as Response);

      // Assert
      expect(ResponseHelper.error).toHaveBeenCalledWith(
        mockResponse,
        'Producto not found',
        404
      );
    });
  });

  describe('updateStock', () => {
    it('should update stock successfully', async () => {
      // Arrange
      const stockData = {
        cantidad: 10,
        operacion: 'add'
      };

      const mockProducto = {
        id: 1,
        codigo: 'DEP-001',
        nombre: 'Balón de Fútbol',
        stock: 60,
        activo: true
      };

      mockRequest.params = { id: '1' };
      mockRequest.body = stockData;
      mockRequest.user = { id: 1, rol: 'admin' };
      
      mockProductoDAO.findById = jest.fn().mockResolvedValue(mockProducto);
      mockProductoDAO.updateStock = jest.fn().mockResolvedValue(mockProducto);

      // Act
      await productoController.updateStock(mockRequest as Request, mockResponse as Response);

      // Assert
      expect(mockProductoDAO.updateStock).toHaveBeenCalledWith(1, 10, 'add');
      expect(ResponseHelper.success).toHaveBeenCalledWith(
        mockResponse,
        mockProducto,
        'Stock updated successfully'
      );
    });

    it('should return error for invalid operation', async () => {
      // Arrange
      const stockData = {
        cantidad: 10,
        operacion: 'invalid'
      };

      mockRequest.params = { id: '1' };
      mockRequest.body = stockData;
      mockRequest.user = { id: 1, rol: 'admin' };

      // Act
      await productoController.updateStock(mockRequest as Request, mockResponse as Response);

      // Assert
      expect(ResponseHelper.validationError).toHaveBeenCalledWith(
        mockResponse,
        'Invalid operation. Must be add, subtract, or set'
      );
    });
  });
});
