import { Model, WhereOptions, FindOptions, CreateOptions, UpdateOptions, DestroyOptions } from 'sequelize';
import { Logger } from '../utils/helpers';

/**
 * Base DAO class that provides common database operations
 * Implements Clean Code principles by eliminating code duplication
 */
export abstract class BaseDAO<T extends Model> {
  protected readonly logger = Logger;
  protected model: typeof Model;

  constructor(model: typeof Model) {
    this.model = model;
  }

  /**
   * Find all records with optional filters and pagination
   */
  async findAll(options: {
    filters?: WhereOptions;
    pagination?: { page: number; limit: number };
    order?: any[];
    include?: any[];
  } = {}): Promise<{
    items: T[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  }> {
    try {
      const { filters = {}, pagination, order = [['createdAt', 'DESC']], include = [] } = options;
      
      const findOptions: FindOptions = {
        where: filters,
        order,
        include
      };

      if (pagination) {
        const { page, limit } = pagination;
        const offset = (page - 1) * limit;
        
        findOptions.limit = limit;
        findOptions.offset = offset;
      }

      const { count, rows } = await this.model.findAndCountAll(findOptions);
      
      const totalPages = pagination ? Math.ceil(count / pagination.limit) : 1;

      return {
        items: rows as T[],
        total: count,
        page: pagination?.page || 1,
        limit: pagination?.limit || count,
        totalPages
      };
    } catch (error) {
      this.logger.error('Error finding all records:', error);
      throw error;
    }
  }

  /**
   * Find record by ID
   */
  async findById(id: number, include?: any[]): Promise<T | null> {
    try {
      const findOptions: FindOptions = {};
      
      if (include) {
        findOptions.include = include;
      }

      const record = await this.model.findByPk(id, findOptions);
      return record as T | null;
    } catch (error) {
      this.logger.error(`Error finding record by ID ${id}:`, error);
      throw error;
    }
  }

  /**
   * Find record by field
   */
  async findByField(field: string, value: any, include?: any[]): Promise<T | null> {
    try {
      const findOptions: FindOptions = {
        where: { [field]: value }
      };
      
      if (include) {
        findOptions.include = include;
      }

      const record = await this.model.findOne(findOptions);
      return record as T | null;
    } catch (error) {
      this.logger.error(`Error finding record by ${field}:`, error);
      throw error;
    }
  }

  /**
   * Find multiple records by field
   */
  async findByFieldMultiple(field: string, values: any[], include?: any[]): Promise<T[]> {
    try {
      const findOptions: FindOptions = {
        where: { [field]: values }
      };
      
      if (include) {
        findOptions.include = include;
      }

      const records = await this.model.findAll(findOptions);
      return records as T[];
    } catch (error) {
      this.logger.error(`Error finding records by ${field}:`, error);
      throw error;
    }
  }

  /**
   * Create new record
   */
  async create(data: any, options?: CreateOptions): Promise<T> {
    try {
      const record = await this.model.create(data, options);
      this.logger.info(`Record created with ID: ${record.get('id')}`);
      return record as T;
    } catch (error) {
      this.logger.error('Error creating record:', error);
      throw error;
    }
  }

  /**
   * Create multiple records
   */
  async createBulk(data: any[], options?: CreateOptions): Promise<T[]> {
    try {
      const records = await this.model.bulkCreate(data, options);
      this.logger.info(`${records.length} records created`);
      return records as T[];
    } catch (error) {
      this.logger.error('Error creating bulk records:', error);
      throw error;
    }
  }

  /**
   * Update record by ID
   */
  async update(id: number, data: any, options?: UpdateOptions): Promise<T | null> {
    try {
      const [affectedCount] = await this.model.update(data, {
        where: { id },
        ...options
      });

      if (affectedCount === 0) {
        return null;
      }

      const updatedRecord = await this.findById(id);
      this.logger.info(`Record with ID ${id} updated`);
      return updatedRecord;
    } catch (error) {
      this.logger.error(`Error updating record with ID ${id}:`, error);
      throw error;
    }
  }

  /**
   * Update multiple records
   */
  async updateBulk(filters: WhereOptions, data: any, options?: UpdateOptions): Promise<number> {
    try {
      const [affectedCount] = await this.model.update(data, {
        where: filters,
        ...options
      });

      this.logger.info(`${affectedCount} records updated`);
      return affectedCount;
    } catch (error) {
      this.logger.error('Error updating bulk records:', error);
      throw error;
    }
  }

  /**
   * Delete record by ID
   */
  async delete(id: number, options?: DestroyOptions): Promise<boolean> {
    try {
      const deletedCount = await this.model.destroy({
        where: { id },
        ...options
      });

      const success = deletedCount > 0;
      this.logger.info(`Record with ID ${id} ${success ? 'deleted' : 'not found'}`);
      return success;
    } catch (error) {
      this.logger.error(`Error deleting record with ID ${id}:`, error);
      throw error;
    }
  }

  /**
   * Delete multiple records
   */
  async deleteBulk(filters: WhereOptions, options?: DestroyOptions): Promise<number> {
    try {
      const deletedCount = await this.model.destroy({
        where: filters,
        ...options
      });

      this.logger.info(`${deletedCount} records deleted`);
      return deletedCount;
    } catch (error) {
      this.logger.error('Error deleting bulk records:', error);
      throw error;
    }
  }

  /**
   * Count records with filters
   */
  async count(filters: WhereOptions = {}): Promise<number> {
    try {
      const count = await this.model.count({ where: filters });
      return count;
    } catch (error) {
      this.logger.error('Error counting records:', error);
      throw error;
    }
  }

  /**
   * Check if record exists
   */
  async exists(filters: WhereOptions): Promise<boolean> {
    try {
      const count = await this.count(filters);
      return count > 0;
    } catch (error) {
      this.logger.error('Error checking record existence:', error);
      throw error;
    }
  }

  /**
   * Find records with search
   */
  async search(searchTerm: string, searchFields: string[], options: {
    filters?: WhereOptions;
    pagination?: { page: number; limit: number };
    order?: any[];
    include?: any[];
  } = {}): Promise<{
    items: T[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  }> {
    try {
      const { Op } = require('sequelize');
      const { filters = {}, pagination, order = [['createdAt', 'DESC']], include = [] } = options;
      
      const searchConditions = searchFields.map(field => ({
        [field]: {
          [Op.iLike]: `%${searchTerm}%`
        }
      }));

      const searchFilters = {
        ...filters,
        [Op.or]: searchConditions
      };

      return this.findAll({
        filters: searchFilters,
        pagination,
        order,
        include
      });
    } catch (error) {
      this.logger.error('Error searching records:', error);
      throw error;
    }
  }

  /**
   * Find records by date range
   */
  async findByDateRange(
    dateField: string,
    startDate: Date,
    endDate: Date,
    options: {
      filters?: WhereOptions;
      pagination?: { page: number; limit: number };
      order?: any[];
      include?: any[];
    } = {}
  ): Promise<{
    items: T[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  }> {
    try {
      const { Op } = require('sequelize');
      const { filters = {}, pagination, order = [['createdAt', 'DESC']], include = [] } = options;
      
      const dateFilters = {
        ...filters,
        [dateField]: {
          [Op.between]: [startDate, endDate]
        }
      };

      return this.findAll({
        filters: dateFilters,
        pagination,
        order,
        include
      });
    } catch (error) {
      this.logger.error('Error finding records by date range:', error);
      throw error;
    }
  }

  /**
   * Get statistics
   */
  async getStatistics(filters: WhereOptions = {}): Promise<{
    total: number;
    active: number;
    inactive: number;
    createdAt: {
      today: number;
      thisWeek: number;
      thisMonth: number;
    };
  }> {
    try {
      const { Op } = require('sequelize');
      const now = new Date();
      const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      const thisWeek = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      const thisMonth = new Date(now.getFullYear(), now.getMonth(), 1);

      const [total, active, inactive, todayCount, weekCount, monthCount] = await Promise.all([
        this.count(filters),
        this.count({ ...filters, activo: true }),
        this.count({ ...filters, activo: false }),
        this.count({ ...filters, createdAt: { [Op.gte]: today } }),
        this.count({ ...filters, createdAt: { [Op.gte]: thisWeek } }),
        this.count({ ...filters, createdAt: { [Op.gte]: thisMonth } })
      ]);

      return {
        total,
        active,
        inactive,
        createdAt: {
          today: todayCount,
          thisWeek: weekCount,
          thisMonth: monthCount
        }
      };
    } catch (error) {
      this.logger.error('Error getting statistics:', error);
      throw error;
    }
  }

  /**
   * Execute raw query
   */
  async executeQuery(query: string, replacements?: any): Promise<any> {
    try {
      const result = await this.model.sequelize?.query(query, {
        replacements,
        type: this.model.sequelize?.QueryTypes.SELECT
      });
      return result;
    } catch (error) {
      this.logger.error('Error executing query:', error);
      throw error;
    }
  }

  /**
   * Begin transaction
   */
  async beginTransaction(): Promise<any> {
    try {
      const transaction = await this.model.sequelize?.transaction();
      return transaction;
    } catch (error) {
      this.logger.error('Error beginning transaction:', error);
      throw error;
    }
  }

  /**
   * Commit transaction
   */
  async commitTransaction(transaction: any): Promise<void> {
    try {
      await transaction.commit();
      this.logger.info('Transaction committed');
    } catch (error) {
      this.logger.error('Error committing transaction:', error);
      throw error;
    }
  }

  /**
   * Rollback transaction
   */
  async rollbackTransaction(transaction: any): Promise<void> {
    try {
      await transaction.rollback();
      this.logger.info('Transaction rolled back');
    } catch (error) {
      this.logger.error('Error rolling back transaction:', error);
      throw error;
    }
  }

  /**
   * Validate data before operations
   */
  protected validateData(data: any, requiredFields: string[]): void {
    const missingFields = requiredFields.filter(field => 
      data[field] === undefined || data[field] === null || data[field] === ''
    );

    if (missingFields.length > 0) {
      throw new Error(`Missing required fields: ${missingFields.join(', ')}`);
    }
  }

  /**
   * Sanitize data
   */
  protected sanitizeData(data: any): any {
    if (typeof data === 'string') {
      return data.trim().replace(/[<>]/g, '');
    }
    
    if (Array.isArray(data)) {
      return data.map(item => this.sanitizeData(item));
    }
    
    if (data && typeof data === 'object') {
      const sanitized: any = {};
      for (const key in data) {
        sanitized[key] = this.sanitizeData(data[key]);
      }
      return sanitized;
    }
    
    return data;
  }
}
