import { Request, Response, NextFunction } from 'express';
import { PedidoEncryptionService } from '../services/PedidoEncryptionService';
import { ResponseHelper } from '../utils/helpers';
import { Logger } from '../utils/helpers';

export class PedidoEncryptionMiddleware {
  private encryptionService: PedidoEncryptionService;

  constructor() {
    this.encryptionService = new PedidoEncryptionService();
  }

  /**
   * Encrypt pedido creation data before processing
   */
  public encryptCreationData = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const userId = (req as any).user?.id;
      
      if (!userId) {
        ResponseHelper.error(res, 'User not authenticated', 401);
        return;
      }

      // Encrypt sensitive creation data
      const encryptedData = await this.encryptionService.encryptPedidoCreationData({
        clienteId: req.body.clienteId,
        usuarioId: userId,
        productos: req.body.productos,
        observaciones: req.body.observaciones
      });

      // Store encrypted data for later use
      (req as any).encryptedCreationData = encryptedData;
      
      // Generate audit log
      const auditLog = await this.encryptionService.generateEncryptionAuditLog(
        'pedido_creation_encrypt',
        0, // Will be updated after creation
        userId
      );
      (req as any).encryptionAuditLog = auditLog;

      Logger.info('Pedido creation data encrypted', { userId });
      next();

    } catch (error) {
      Logger.error('Error encrypting pedido creation data:', error);
      ResponseHelper.error(res, 'Error encrypting pedido data', 500, error);
    }
  };

  /**
   * Encrypt pedido update data before processing
   */
  public encryptUpdateData = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const userId = (req as any).user?.id;
      const pedidoId = parseInt(req.params.id);
      
      if (!userId) {
        ResponseHelper.error(res, 'User not authenticated', 401);
        return;
      }

      // Encrypt sensitive update data
      const encryptedData = await this.encryptionService.encryptPedidoUpdateData({
        pedidoId,
        estado: req.body.estado,
        observaciones: req.body.observaciones,
        updatedBy: userId
      });

      // Store encrypted data for later use
      (req as any).encryptedUpdateData = encryptedData;
      
      // Generate audit log
      const auditLog = await this.encryptionService.generateEncryptionAuditLog(
        'pedido_update_encrypt',
        pedidoId,
        userId
      );
      (req as any).encryptionAuditLog = auditLog;

      Logger.info('Pedido update data encrypted', { pedidoId, userId });
      next();

    } catch (error) {
      Logger.error('Error encrypting pedido update data:', error);
      ResponseHelper.error(res, 'Error encrypting pedido data', 500, error);
    }
  };

  /**
   * Encrypt search filters before processing
   */
  public encryptSearchFilters = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const userId = (req as any).user?.id;
      
      if (!userId) {
        ResponseHelper.error(res, 'User not authenticated', 401);
        return;
      }

      // Extract search filters
      const filters = {
        clienteId: req.query.clienteId ? parseInt(req.query.clienteId as string) : undefined,
        usuarioId: req.query.usuarioId ? parseInt(req.query.usuarioId as string) : undefined,
        estado: req.query.estado as string,
        fechaInicio: req.query.fechaInicio as string,
        fechaFin: req.query.fechaFin as string,
        productoId: req.query.productoId ? parseInt(req.query.productoId as string) : undefined,
        searchBy: userId
      };

      // Encrypt search filters
      const encryptedFilters = await this.encryptionService.encryptPedidoSearchFilters(filters);

      // Store encrypted filters for later use
      (req as any).encryptedSearchFilters = encryptedFilters;
      
      // Generate audit log
      const auditLog = await this.encryptionService.generateEncryptionAuditLog(
        'pedido_search_encrypt',
        0,
        userId
      );
      (req as any).encryptionAuditLog = auditLog;

      Logger.info('Pedido search filters encrypted', { userId });
      next();

    } catch (error) {
      Logger.error('Error encrypting pedido search filters:', error);
      ResponseHelper.error(res, 'Error encrypting search data', 500, error);
    }
  };

  /**
   * Decrypt pedido response data before sending
   */
  public decryptResponseData = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const userId = (req as any).user?.id;
      
      if (!userId) {
        ResponseHelper.error(res, 'User not authenticated', 401);
        return;
      }

      // Store original json method
      const originalJson = res.json;

      // Override json method to decrypt data before sending
      res.json = function(data: any) {
        try {
          // If response contains encrypted pedido data, decrypt it
          if (data && data.data) {
            if (Array.isArray(data.data)) {
              // Handle array of pedidos
              data.data = data.data.map((item: any) => {
                if (item.encryptedData) {
                  return decryptPedidoItem(item, userId);
                }
                return item;
              });
            } else if (data.data.encryptedData) {
              // Handle single pedido
              data.data = decryptPedidoItem(data.data, userId);
            }
          }

          return originalJson.call(this, data);
        } catch (error) {
          Logger.error('Error decrypting response data:', error);
          return originalJson.call(this, data);
        }
      };

      next();

    } catch (error) {
      Logger.error('Error setting up response decryption:', error);
      next();
    }
  };

  /**
   * Encrypt statistics data before sending
   */
  public encryptStatisticsData = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const userId = (req as any).user?.id;
      
      if (!userId) {
        ResponseHelper.error(res, 'User not authenticated', 401);
        return;
      }

      // Store original json method
      const originalJson = res.json;

      // Override json method to encrypt statistics before sending
      res.json = async function(data: any) {
        try {
          if (data && data.data && data.data.totalPedidos !== undefined) {
            // Encrypt statistics data
            const encryptedStats = await this.encryptionService.encryptPedidoStatistics({
              ...data.data,
              generatedBy: userId
            });

            data.data = {
              encrypted: true,
              encryptedData: encryptedStats,
              generatedAt: new Date().toISOString()
            };
          }

          return originalJson.call(this, data);
        } catch (error) {
          Logger.error('Error encrypting statistics data:', error);
          return originalJson.call(this, data);
        }
      }.bind(this);

      next();

    } catch (error) {
      Logger.error('Error setting up statistics encryption:', error);
      next();
    }
  };

  /**
   * Verify encryption integrity
   */
  public verifyIntegrity = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const encryptedData = req.body.encryptedData || req.query.encryptedData;
      
      if (encryptedData) {
        const isValid = await this.encryptionService.verifyEncryptionIntegrity(encryptedData);
        
        if (!isValid) {
          ResponseHelper.error(res, 'Encryption integrity verification failed', 400);
          return;
        }

        Logger.info('Encryption integrity verified', { 
          endpoint: req.path,
          method: req.method 
        });
      }

      next();

    } catch (error) {
      Logger.error('Error verifying encryption integrity:', error);
      ResponseHelper.error(res, 'Error verifying encryption integrity', 500, error);
    }
  };

  /**
   * Log encryption operations
   */
  public logEncryptionOperation = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const userId = (req as any).user?.id;
      const operation = req.method + ' ' + req.path;
      
      if (userId) {
        Logger.info('Encryption operation logged', {
          operation,
          userId,
          timestamp: new Date().toISOString(),
          userAgent: req.get('User-Agent'),
          ip: req.ip
        });
      }

      next();

    } catch (error) {
      Logger.error('Error logging encryption operation:', error);
      next();
    }
  };
}

/**
 * Helper function to decrypt pedido item
 */
async function decryptPedidoItem(item: any, userId: number): Promise<any> {
  try {
    const encryptionService = new PedidoEncryptionService();
    
    if (item.encryptedData) {
      const decryptedData = await encryptionService.decryptPedidoData(item.encryptedData);
      
      return {
        ...item,
        observaciones: decryptedData.observaciones,
        detalles: decryptedData.detalles,
        metadata: decryptedData.metadata,
        encryptedData: undefined // Remove encrypted data from response
      };
    }
    
    return item;
  } catch (error) {
    Logger.error('Error decrypting pedido item:', error);
    return item;
  }
}
