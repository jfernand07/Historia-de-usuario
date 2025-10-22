import { Request, Response } from 'express';
import { ProductoDAO } from '../dao/ProductoDAO';
import { ResponseHelper } from '../utils/helpers';
import { ValidationMiddleware } from '../middlewares/ValidationMiddleware';
import { productSchemas } from '../dto/validationSchemas';

export class ProductoController {
  private productoDAO: ProductoDAO;

  constructor() {
    this.productoDAO = new ProductoDAO();
  }

  /**
   * Get all productos with filters and pagination
   */
  public getAllProductos = async (req: Request, res: Response): Promise<void> => {
    try {
      const filters = {
        categoria: req.query.categoria as string | undefined,
        activo: req.query.activo === 'true' ? true : req.query.activo === 'false' ? false : undefined,
        search: req.query.search as string | undefined,
        minPrecio: req.query.minPrecio ? parseFloat(req.query.minPrecio as string) : undefined,
        maxPrecio: req.query.maxPrecio ? parseFloat(req.query.maxPrecio as string) : undefined
      };

      const pagination = {
        page: parseInt(req.query.page as string) || 1,
        limit: parseInt(req.query.limit as string) || 10
      };

      const result = await this.productoDAO.findAll({
        filters,
        pagination,
        order: [['createdAt', 'DESC']]
      });

      ResponseHelper.success(res, {
        productos: result.productos,
        pagination: {
          page: result.page,
          limit: result.limit,
          total: result.total,
          totalPages: result.totalPages
        }
      }, 'Productos retrieved successfully');

    } catch (error) {
      ResponseHelper.error(res, 'Error retrieving productos', 500, error);
    }
  };

  /**
   * Get producto by ID
   */
  public getProductoById = async (req: Request, res: Response): Promise<void> => {
    try {
      const id = parseInt(req.params.id);
      
      const producto = await this.productoDAO.findById(id);
      
      if (!producto) {
        ResponseHelper.error(res, 'Producto not found', 404);
        return;
      }

      ResponseHelper.success(res, producto, 'Producto retrieved successfully');

    } catch (error) {
      ResponseHelper.error(res, 'Error retrieving producto', 500, error);
    }
  };

  /**
   * Get producto by code
   */
  public getProductoByCode = async (req: Request, res: Response): Promise<void> => {
    try {
      const codigo = req.params.codigo;
      
      const producto = await this.productoDAO.findByCode(codigo);
      
      if (!producto) {
        ResponseHelper.error(res, 'Producto not found', 404);
        return;
      }

      ResponseHelper.success(res, producto, 'Producto retrieved successfully');

    } catch (error) {
      ResponseHelper.error(res, 'Error retrieving producto', 500, error);
    }
  };

  /**
   * Create new producto
   */
  public createProducto = async (req: Request, res: Response): Promise<void> => {
    try {
      const productoData = req.body;

      // Check if code already exists
      const codeExists = await this.productoDAO.codeExists(productoData.codigo);
      if (codeExists) {
        ResponseHelper.error(res, 'Product code already exists', 409);
        return;
      }

      const producto = await this.productoDAO.create(productoData);
      
      ResponseHelper.success(res, producto, 'Producto created successfully', 201);

    } catch (error) {
      ResponseHelper.error(res, 'Error creating producto', 500, error);
    }
  };

  /**
   * Update producto
   */
  public updateProducto = async (req: Request, res: Response): Promise<void> => {
    try {
      const id = parseInt(req.params.id);
      const updateData = req.body;

      // Check if code is being updated and if it already exists
      if (updateData.codigo) {
        const codeExists = await this.productoDAO.codeExists(updateData.codigo, id);
        if (codeExists) {
          ResponseHelper.error(res, 'Product code already exists', 409);
          return;
        }
      }

      const producto = await this.productoDAO.update(id, updateData);
      
      if (!producto) {
        ResponseHelper.error(res, 'Producto not found', 404);
        return;
      }

      ResponseHelper.success(res, producto, 'Producto updated successfully');

    } catch (error) {
      ResponseHelper.error(res, 'Error updating producto', 500, error);
    }
  };

  /**
   * Delete producto (soft delete)
   */
  public deleteProducto = async (req: Request, res: Response): Promise<void> => {
    try {
      const id = parseInt(req.params.id);
      
      const success = await this.productoDAO.delete(id);
      
      if (!success) {
        ResponseHelper.error(res, 'Producto not found', 404);
        return;
      }

      ResponseHelper.success(res, null, 'Producto deleted successfully');

    } catch (error) {
      ResponseHelper.error(res, 'Error deleting producto', 500, error);
    }
  };

  /**
   * Update producto stock
   */
  public updateStock = async (req: Request, res: Response): Promise<void> => {
    try {
      const id = parseInt(req.params.id);
      const { cantidad, operacion } = req.body; // operacion: 'add' | 'subtract' | 'set'

      if (!cantidad || cantidad < 0) {
        ResponseHelper.validationError(res, 'Cantidad must be a positive number');
        return;
      }

      if (!['add', 'subtract', 'set'].includes(operacion)) {
        ResponseHelper.validationError(res, 'Operacion must be add, subtract, or set');
        return;
      }

      const producto = await this.productoDAO.updateStock(id, cantidad, operacion);
      
      if (!producto) {
        ResponseHelper.error(res, 'Producto not found', 404);
        return;
      }

      ResponseHelper.success(res, producto, 'Stock updated successfully');

    } catch (error) {
      ResponseHelper.error(res, 'Error updating stock', 500, error);
    }
  };

  /**
   * Get productos by category
   */
  public getProductosByCategory = async (req: Request, res: Response): Promise<void> => {
    try {
      const categoria = req.params.categoria;
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 10;

      const result = await this.productoDAO.findAll({
        filters: { categoria, activo: true },
        pagination: { page, limit },
        order: [['nombre', 'ASC']]
      });

      ResponseHelper.success(res, {
        productos: result.productos,
        categoria,
        pagination: {
          page: result.page,
          limit: result.limit,
          total: result.total,
          totalPages: result.totalPages
        }
      }, 'Productos by category retrieved successfully');

    } catch (error) {
      ResponseHelper.error(res, 'Error retrieving productos by category', 500, error);
    }
  };

  /**
   * Search productos
   */
  public searchProductos = async (req: Request, res: Response): Promise<void> => {
    try {
      const searchTerm = req.query.q as string;
      
      if (!searchTerm || searchTerm.trim().length < 2) {
        ResponseHelper.validationError(res, 'Search term must be at least 2 characters long');
        return;
      }

      const result = await this.productoDAO.findAll({
        filters: { search: searchTerm.trim(), activo: true },
        pagination: { page: 1, limit: 20 },
        order: [['nombre', 'ASC']]
      });

      ResponseHelper.success(res, {
        productos: result.productos,
        total: result.total,
        searchTerm
      }, 'Search completed successfully');

    } catch (error) {
      ResponseHelper.error(res, 'Error searching productos', 500, error);
    }
  };

  /**
   * Get low stock productos
   */
  public getLowStockProductos = async (req: Request, res: Response): Promise<void> => {
    try {
      const threshold = parseInt(req.query.threshold as string) || 10;

      const productos = await this.productoDAO.findLowStock(threshold);

      ResponseHelper.success(res, {
        productos,
        threshold,
        count: productos.length
      }, 'Low stock productos retrieved successfully');

    } catch (error) {
      ResponseHelper.error(res, 'Error retrieving low stock productos', 500, error);
    }
  };

  /**
   * Get producto statistics
   */
  public getProductoStatistics = async (req: Request, res: Response): Promise<void> => {
    try {
      const statistics = await this.productoDAO.getStatistics();
      
      ResponseHelper.success(res, statistics, 'Producto statistics retrieved successfully');

    } catch (error) {
      ResponseHelper.error(res, 'Error retrieving producto statistics', 500, error);
    }
  };
}
