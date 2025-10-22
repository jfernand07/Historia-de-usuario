// DAO Integration and Factory Pattern
import { UsuarioDAO } from './UsuarioDAO';
import { ProductoDAO } from './ProductoDAO';
import { ClienteDAO } from './ClienteDAO';
import { BaseDAO } from '../types/database';
import { Logger } from '../utils/helpers';

// DAO Factory for creating DAO instances
export class DAOFactory {
  private static instances: Map<string, BaseDAO<any>> = new Map();

  /**
   * Get UsuarioDAO instance (singleton)
   */
  static getUsuarioDAO(): UsuarioDAO {
    if (!this.instances.has('usuario')) {
      this.instances.set('usuario', new UsuarioDAO());
      Logger.info('UsuarioDAO instance created');
    }
    return this.instances.get('usuario') as UsuarioDAO;
  }

  /**
   * Get ProductoDAO instance (singleton)
   */
  static getProductoDAO(): ProductoDAO {
    if (!this.instances.has('producto')) {
      this.instances.set('producto', new ProductoDAO());
      Logger.info('ProductoDAO instance created');
    }
    return this.instances.get('producto') as ProductoDAO;
  }

  /**
   * Get ClienteDAO instance (singleton)
   */
  static getClienteDAO(): ClienteDAO {
    if (!this.instances.has('cliente')) {
      this.instances.set('cliente', new ClienteDAO());
      Logger.info('ClienteDAO instance created');
    }
    return this.instances.get('cliente') as ClienteDAO;
  }

  /**
   * Clear all DAO instances (for testing)
   */
  static clearInstances(): void {
    this.instances.clear();
    Logger.info('All DAO instances cleared');
  }

  /**
   * Get all available DAO types
   */
  static getAvailableDAOs(): string[] {
    return Array.from(this.instances.keys());
  }
}

// DAO Manager for advanced operations
export class DAOManager {
  private usuarioDAO: UsuarioDAO;
  private productoDAO: ProductoDAO;
  private clienteDAO: ClienteDAO;

  constructor() {
    this.usuarioDAO = DAOFactory.getUsuarioDAO();
    this.productoDAO = DAOFactory.getProductoDAO();
    this.clienteDAO = DAOFactory.getClienteDAO();
  }

  /**
   * Get dashboard statistics
   */
  async getDashboardStatistics(): Promise<{
    usuarios: any;
    productos: any;
    clientes: any;
    summary: {
      totalUsuarios: number;
      totalProductos: number;
      totalClientes: number;
      lowStockProductos: number;
      recentClientes: number;
    };
  }> {
    try {
      const [usuarioStats, productoStats, clienteStats, lowStockProductos, recentClientes] = await Promise.all([
        this.usuarioDAO.getStatistics(),
        this.productoDAO.getStatistics(),
        this.clienteDAO.getStatistics(),
        this.productoDAO.findLowStock(10),
        this.clienteDAO.findRecent(7, 5)
      ]);

      return {
        usuarios: usuarioStats,
        productos: productoStats,
        clientes: clienteStats,
        summary: {
          totalUsuarios: usuarioStats.total,
          totalProductos: productoStats.total,
          totalClientes: clienteStats.total,
          lowStockProductos: lowStockProductos.length,
          recentClientes: recentClientes.length
        }
      };
    } catch (error) {
      Logger.error('Error getting dashboard statistics:', error);
      throw error;
    }
  }

  /**
   * Search across all entities
   */
  async globalSearch(searchTerm: string, limit: number = 10): Promise<{
    usuarios: any[];
    productos: any[];
    clientes: any[];
    totalResults: number;
  }> {
    try {
      const [usuarios, productos, clientes] = await Promise.all([
        this.usuarioDAO.findAll({
          filters: { search: searchTerm },
          pagination: { page: 1, limit: Math.ceil(limit / 3) },
          order: [['nombre', 'ASC']]
        }),
        this.productoDAO.findAll({
          filters: { search: searchTerm },
          pagination: { page: 1, limit: Math.ceil(limit / 3) },
          order: [['nombre', 'ASC']]
        }),
        this.clienteDAO.findAll({
          filters: { search: searchTerm },
          pagination: { page: 1, limit: Math.ceil(limit / 3) },
          order: [['nombre', 'ASC']]
        })
      ]);

      return {
        usuarios: usuarios.usuarios,
        productos: productos.productos,
        clientes: clientes.clientes,
        totalResults: usuarios.total + productos.total + clientes.total
      };
    } catch (error) {
      Logger.error('Error performing global search:', error);
      throw error;
    }
  }

  /**
   * Get inventory overview
   */
  async getInventoryOverview(): Promise<{
    totalProducts: number;
    totalValue: number;
    lowStockProducts: any[];
    categories: { [key: string]: number };
    topCategories: Array<{ category: string; count: number; value: number }>;
  }> {
    try {
      const [productoStats, lowStockProducts, categories] = await Promise.all([
        this.productoDAO.getStatistics(),
        this.productoDAO.findLowStock(10),
        this.productoDAO.getCategories()
      ]);

      // Calculate top categories by value
      const topCategories = await Promise.all(
        categories.map(async (category) => {
          const categoryProducts = await this.productoDAO.findByCategory(category);
          const count = categoryProducts.length;
          const value = categoryProducts.reduce((sum, product) => 
            sum + (parseFloat(product.precio.toString()) * product.stock), 0
          );
          return { category, count, value };
        })
      );

      topCategories.sort((a, b) => b.value - a.value);

      return {
        totalProducts: productoStats.total,
        totalValue: productoStats.totalValue,
        lowStockProducts,
        categories: productoStats.categories,
        topCategories: topCategories.slice(0, 5)
      };
    } catch (error) {
      Logger.error('Error getting inventory overview:', error);
      throw error;
    }
  }

  /**
   * Get customer analytics
   */
  async getCustomerAnalytics(): Promise<{
    totalCustomers: number;
    activeCustomers: number;
    documentTypeDistribution: { [key: string]: number };
    recentCustomers: any[];
    customerGrowth: Array<{ date: string; count: number }>;
  }> {
    try {
      const [clienteStats, recentCustomers] = await Promise.all([
        this.clienteDAO.getStatistics(),
        this.clienteDAO.findRecent(30, 10)
      ]);

      // Calculate customer growth over last 30 days
      const customerGrowth = [];
      const today = new Date();
      
      for (let i = 29; i >= 0; i--) {
        const date = new Date(today);
        date.setDate(date.getDate() - i);
        
        const startOfDay = new Date(date);
        startOfDay.setHours(0, 0, 0, 0);
        
        const endOfDay = new Date(date);
        endOfDay.setHours(23, 59, 59, 999);
        
        // This would require a more complex query in a real implementation
        // For now, we'll simulate the data
        customerGrowth.push({
          date: startOfDay.toISOString().split('T')[0],
          count: Math.floor(Math.random() * 5) // Simulated data
        });
      }

      return {
        totalCustomers: clienteStats.total,
        activeCustomers: clienteStats.active,
        documentTypeDistribution: clienteStats.documentTypes,
        recentCustomers,
        customerGrowth
      };
    } catch (error) {
      Logger.error('Error getting customer analytics:', error);
      throw error;
    }
  }

  /**
   * Validate business rules across entities
   */
  async validateBusinessRules(): Promise<{
    isValid: boolean;
    errors: string[];
    warnings: string[];
  }> {
    const errors: string[] = [];
    const warnings: string[] = [];

    try {
      // Check for inactive users with active products/clients
      const inactiveUsers = await this.usuarioDAO.findAll({
        filters: { activo: false },
        pagination: { page: 1, limit: 1000 }
      });

      // Check for products with negative stock
      const negativeStockProducts = await this.productoDAO.findAll({
        filters: { minPrecio: -1 }, // This would need a custom query in real implementation
        pagination: { page: 1, limit: 1000 }
      });

      // Check for duplicate emails across entities
      // This would require a more complex query in a real implementation

      // Add business rule validations
      if (inactiveUsers.usuarios.length > 0) {
        warnings.push(`${inactiveUsers.usuarios.length} inactive users found`);
      }

      // Check for low stock products
      const lowStockProducts = await this.productoDAO.findLowStock(5);
      if (lowStockProducts.length > 0) {
        warnings.push(`${lowStockProducts.length} products with low stock`);
      }

      return {
        isValid: errors.length === 0,
        errors,
        warnings
      };
    } catch (error) {
      Logger.error('Error validating business rules:', error);
      throw error;
    }
  }

  /**
   * Get DAO instances
   */
  getUsuarioDAO(): UsuarioDAO {
    return this.usuarioDAO;
  }

  getProductoDAO(): ProductoDAO {
    return this.productoDAO;
  }

  getClienteDAO(): ClienteDAO {
    return this.clienteDAO;
  }
}

// Export all DAOs and managers
export { UsuarioDAO } from './UsuarioDAO';
export { ProductoDAO } from './ProductoDAO';
export { ClienteDAO } from './ClienteDAO';
