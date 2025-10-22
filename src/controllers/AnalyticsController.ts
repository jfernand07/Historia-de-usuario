import { Request, Response } from 'express';
import { DAOManager } from '../dao';
import { ResponseHelper } from '../utils/helpers';
import { AuthMiddleware } from '../middlewares/AuthMiddleware';

export class AnalyticsController {
  private daoManager: DAOManager;
  private authMiddleware: AuthMiddleware;

  constructor() {
    this.daoManager = new DAOManager();
    this.authMiddleware = new AuthMiddleware();
  }

  /**
   * Get dashboard statistics
   */
  public getDashboardStatistics = async (req: Request, res: Response): Promise<void> => {
    try {
      const statistics = await this.daoManager.getDashboardStatistics();
      
      ResponseHelper.success(res, statistics, 'Dashboard statistics retrieved successfully');

    } catch (error) {
      ResponseHelper.error(res, 'Error retrieving dashboard statistics', 500, error);
    }
  };

  /**
   * Perform global search across all entities
   */
  public globalSearch = async (req: Request, res: Response): Promise<void> => {
    try {
      const searchTerm = req.query.q as string;
      const limit = parseInt(req.query.limit as string) || 10;

      if (!searchTerm || searchTerm.trim().length < 2) {
        ResponseHelper.validationError(res, 'Search term must be at least 2 characters long');
        return;
      }

      const results = await this.daoManager.globalSearch(searchTerm.trim(), limit);
      
      ResponseHelper.success(res, {
        ...results,
        searchTerm: searchTerm.trim()
      }, 'Global search completed successfully');

    } catch (error) {
      ResponseHelper.error(res, 'Error performing global search', 500, error);
    }
  };

  /**
   * Get inventory overview
   */
  public getInventoryOverview = async (req: Request, res: Response): Promise<void> => {
    try {
      const overview = await this.daoManager.getInventoryOverview();
      
      ResponseHelper.success(res, overview, 'Inventory overview retrieved successfully');

    } catch (error) {
      ResponseHelper.error(res, 'Error retrieving inventory overview', 500, error);
    }
  };

  /**
   * Get customer analytics
   */
  public getCustomerAnalytics = async (req: Request, res: Response): Promise<void> => {
    try {
      const analytics = await this.daoManager.getCustomerAnalytics();
      
      ResponseHelper.success(res, analytics, 'Customer analytics retrieved successfully');

    } catch (error) {
      ResponseHelper.error(res, 'Error retrieving customer analytics', 500, error);
    }
  };

  /**
   * Validate business rules
   */
  public validateBusinessRules = async (req: Request, res: Response): Promise<void> => {
    try {
      const validation = await this.daoManager.validateBusinessRules();
      
      ResponseHelper.success(res, validation, 'Business rules validation completed');

    } catch (error) {
      ResponseHelper.error(res, 'Error validating business rules', 500, error);
    }
  };

  /**
   * Get system health status
   */
  public getSystemHealth = async (req: Request, res: Response): Promise<void> => {
    try {
      const [dashboardStats, businessValidation] = await Promise.all([
        this.daoManager.getDashboardStatistics(),
        this.daoManager.validateBusinessRules()
      ]);

      const healthStatus = {
        status: businessValidation.isValid ? 'healthy' : 'warning',
        timestamp: new Date().toISOString(),
        statistics: {
          totalEntities: dashboardStats.summary.totalUsuarios + 
                        dashboardStats.summary.totalProductos + 
                        dashboardStats.summary.totalClientes,
          activeEntities: dashboardStats.summary.totalUsuarios + 
                         dashboardStats.summary.totalProductos + 
                         dashboardStats.summary.totalClientes,
          warnings: businessValidation.warnings.length,
          errors: businessValidation.errors.length
        },
        alerts: {
          lowStock: dashboardStats.summary.lowStockProductos > 0,
          inactiveUsers: dashboardStats.usuarios.inactive > 0,
          businessRuleViolations: businessValidation.errors.length > 0
        }
      };

      ResponseHelper.success(res, healthStatus, 'System health status retrieved successfully');

    } catch (error) {
      ResponseHelper.error(res, 'Error retrieving system health status', 500, error);
    }
  };

  /**
   * Get entity relationships
   */
  public getEntityRelationships = async (req: Request, res: Response): Promise<void> => {
    try {
      const relationships = {
        usuarios: {
          total: (await this.daoManager.getUsuarioDAO().getStatistics()).total,
          roles: {
            admin: (await this.daoManager.getUsuarioDAO().getStatistics() as any).admins || 0,
            vendedor: (await this.daoManager.getUsuarioDAO().getStatistics() as any).vendedores || 0
          }
        },
        productos: {
          total: (await this.daoManager.getProductoDAO().getStatistics()).total,
          categories: Object.keys((await this.daoManager.getProductoDAO().getStatistics() as any).categories || {}),
          lowStock: (await this.daoManager.getProductoDAO().findLowStock(10)).length
        },
        clientes: {
          total: (await this.daoManager.getClienteDAO().getStatistics()).total,
          documentTypes: Object.keys((await this.daoManager.getClienteDAO().getStatistics()).documentTypes),
          recent: (await this.daoManager.getClienteDAO().findRecent(7, 5)).length
        },
        relationships: {
          'usuarios-pedidos': 'One-to-Many (Usuario can have multiple Pedidos)',
          'clientes-pedidos': 'One-to-Many (Cliente can have multiple Pedidos)',
          'productos-pedidos': 'Many-to-Many (Producto can be in multiple Pedidos)',
          'pedidos-detallePedidos': 'One-to-Many (Pedido can have multiple DetallePedidos)'
        }
      };

      ResponseHelper.success(res, relationships, 'Entity relationships retrieved successfully');

    } catch (error) {
      ResponseHelper.error(res, 'Error retrieving entity relationships', 500, error);
    }
  };
}
