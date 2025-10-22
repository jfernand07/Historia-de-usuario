import { Request, Response } from 'express';
import { PedidoEncryptionService } from '../services/PedidoEncryptionService';
import { PedidoDAO } from '../dao/PedidoDAO';
import { ResponseHelper } from '../utils/helpers';
import { Logger } from '../utils/helpers';

export class PedidoEncryptionController {
  private encryptionService: PedidoEncryptionService;
  private pedidoDAO: PedidoDAO;

  constructor() {
    this.encryptionService = new PedidoEncryptionService();
    this.pedidoDAO = new PedidoDAO();
  }

  /**
   * Encrypt pedido data
   */
  public encryptPedido = async (req: Request, res: Response): Promise<void> => {
    try {
      const { id } = req.params;
      const pedidoId = parseInt(id);

      if (isNaN(pedidoId)) {
        ResponseHelper.badRequest(res, 'Invalid pedido ID');
        return;
      }

      // Get pedido with detalles
      const pedido = await this.pedidoDAO.findByIdWithDetalles(pedidoId);

      if (!pedido) {
        ResponseHelper.notFound(res, 'Pedido not found');
        return;
      }

      // Encrypt pedido data
      const encryptedData = await this.encryptionService.encryptPedidoData(pedido);

      ResponseHelper.success(res, {
        pedidoId: pedido.id,
        encryptedData,
        encryptedAt: new Date().toISOString()
      }, 'Pedido data encrypted successfully');

    } catch (error) {
      Logger.error('Error encrypting pedido:', error);
      ResponseHelper.internalError(res, 'Error encrypting pedido data');
    }
  };

  /**
   * Decrypt pedido data
   */
  public decryptPedido = async (req: Request, res: Response): Promise<void> => {
    try {
      const { encryptedData } = req.body;

      if (!encryptedData) {
        ResponseHelper.badRequest(res, 'Encrypted data is required');
        return;
      }

      // Decrypt pedido data
      const decryptedData = await this.encryptionService.decryptPedidoData(encryptedData);

      ResponseHelper.success(res, {
        decryptedData,
        decryptedAt: new Date().toISOString()
      }, 'Pedido data decrypted successfully');

    } catch (error) {
      Logger.error('Error decrypting pedido:', error);
      ResponseHelper.internalError(res, 'Error decrypting pedido data');
    }
  };

  /**
   * Encrypt pedido creation data
   */
  public encryptCreationData = async (req: Request, res: Response): Promise<void> => {
    try {
      const userId = (req as any).user?.id;
      const { clienteId, productos, observaciones } = req.body;

      if (!userId) {
        ResponseHelper.unauthorized(res, 'User not authenticated');
        return;
      }

      // Encrypt creation data
      const encryptedData = await this.encryptionService.encryptPedidoCreationData({
        clienteId,
        usuarioId: userId,
        productos,
        observaciones
      });

      ResponseHelper.success(res, {
        encryptedData,
        encryptedAt: new Date().toISOString()
      }, 'Pedido creation data encrypted successfully');

    } catch (error) {
      Logger.error('Error encrypting creation data:', error);
      ResponseHelper.internalError(res, 'Error encrypting creation data');
    }
  };

  /**
   * Decrypt pedido creation data
   */
  public decryptCreationData = async (req: Request, res: Response): Promise<void> => {
    try {
      const { encryptedData } = req.body;

      if (!encryptedData) {
        ResponseHelper.badRequest(res, 'Encrypted data is required');
        return;
      }

      // Decrypt creation data
      const decryptedData = await this.encryptionService.decryptPedidoCreationData(encryptedData);

      ResponseHelper.success(res, {
        decryptedData,
        decryptedAt: new Date().toISOString()
      }, 'Pedido creation data decrypted successfully');

    } catch (error) {
      Logger.error('Error decrypting creation data:', error);
      ResponseHelper.internalError(res, 'Error decrypting creation data');
    }
  };

  /**
   * Encrypt pedido update data
   */
  public encryptUpdateData = async (req: Request, res: Response): Promise<void> => {
    try {
      const userId = (req as any).user?.id;
      const { id } = req.params;
      const { estado, observaciones } = req.body;

      const pedidoId = parseInt(id);

      if (isNaN(pedidoId)) {
        ResponseHelper.badRequest(res, 'Invalid pedido ID');
        return;
      }

      if (!userId) {
        ResponseHelper.unauthorized(res, 'User not authenticated');
        return;
      }

      // Encrypt update data
      const encryptedData = await this.encryptionService.encryptPedidoUpdateData({
        pedidoId,
        estado,
        observaciones,
        updatedBy: userId
      });

      ResponseHelper.success(res, {
        pedidoId,
        encryptedData,
        encryptedAt: new Date().toISOString()
      }, 'Pedido update data encrypted successfully');

    } catch (error) {
      Logger.error('Error encrypting update data:', error);
      ResponseHelper.internalError(res, 'Error encrypting update data');
    }
  };

  /**
   * Decrypt pedido update data
   */
  public decryptUpdateData = async (req: Request, res: Response): Promise<void> => {
    try {
      const { encryptedData } = req.body;

      if (!encryptedData) {
        ResponseHelper.badRequest(res, 'Encrypted data is required');
        return;
      }

      // Decrypt update data
      const decryptedData = await this.encryptionService.decryptPedidoUpdateData(encryptedData);

      ResponseHelper.success(res, {
        decryptedData,
        decryptedAt: new Date().toISOString()
      }, 'Pedido update data decrypted successfully');

    } catch (error) {
      Logger.error('Error decrypting update data:', error);
      ResponseHelper.internalError(res, 'Error decrypting update data');
    }
  };

  /**
   * Encrypt search filters
   */
  public encryptSearchFilters = async (req: Request, res: Response): Promise<void> => {
    try {
      const userId = (req as any).user?.id;
      const { clienteId, usuarioId, estado, fechaInicio, fechaFin, productoId } = req.body;

      if (!userId) {
        ResponseHelper.unauthorized(res, 'User not authenticated');
        return;
      }

      // Encrypt search filters
      const encryptedFilters = await this.encryptionService.encryptPedidoSearchFilters({
        clienteId,
        usuarioId,
        estado,
        fechaInicio,
        fechaFin,
        productoId,
        searchBy: userId
      });

      ResponseHelper.success(res, {
        encryptedFilters,
        encryptedAt: new Date().toISOString()
      }, 'Search filters encrypted successfully');

    } catch (error) {
      Logger.error('Error encrypting search filters:', error);
      ResponseHelper.internalError(res, 'Error encrypting search filters');
    }
  };

  /**
   * Decrypt search filters
   */
  public decryptSearchFilters = async (req: Request, res: Response): Promise<void> => {
    try {
      const { encryptedFilters } = req.body;

      if (!encryptedFilters) {
        ResponseHelper.badRequest(res, 'Encrypted filters are required');
        return;
      }

      // Decrypt search filters
      const decryptedFilters = await this.encryptionService.decryptPedidoSearchFilters(encryptedFilters);

      ResponseHelper.success(res, {
        decryptedFilters,
        decryptedAt: new Date().toISOString()
      }, 'Search filters decrypted successfully');

    } catch (error) {
      Logger.error('Error decrypting search filters:', error);
      ResponseHelper.internalError(res, 'Error decrypting search filters');
    }
  };

  /**
   * Encrypt statistics data
   */
  public encryptStatistics = async (req: Request, res: Response): Promise<void> => {
    try {
      const userId = (req as any).user?.id;
      const statistics = req.body;

      if (!userId) {
        ResponseHelper.unauthorized(res, 'User not authenticated');
        return;
      }

      // Encrypt statistics
      const encryptedStats = await this.encryptionService.encryptPedidoStatistics({
        ...statistics,
        generatedBy: userId
      });

      ResponseHelper.success(res, {
        encryptedStatistics: encryptedStats,
        encryptedAt: new Date().toISOString()
      }, 'Statistics encrypted successfully');

    } catch (error) {
      Logger.error('Error encrypting statistics:', error);
      ResponseHelper.internalError(res, 'Error encrypting statistics');
    }
  };

  /**
   * Decrypt statistics data
   */
  public decryptStatistics = async (req: Request, res: Response): Promise<void> => {
    try {
      const { encryptedStatistics } = req.body;

      if (!encryptedStatistics) {
        ResponseHelper.badRequest(res, 'Encrypted statistics are required');
        return;
      }

      // Decrypt statistics
      const decryptedStats = await this.encryptionService.decryptPedidoStatistics(encryptedStatistics);

      ResponseHelper.success(res, {
        decryptedStatistics: decryptedStats,
        decryptedAt: new Date().toISOString()
      }, 'Statistics decrypted successfully');

    } catch (error) {
      Logger.error('Error decrypting statistics:', error);
      ResponseHelper.internalError(res, 'Error decrypting statistics');
    }
  };

  /**
   * Verify encryption integrity
   */
  public verifyIntegrity = async (req: Request, res: Response): Promise<void> => {
    try {
      const { encryptedData } = req.body;

      if (!encryptedData) {
        ResponseHelper.badRequest(res, 'Encrypted data is required');
        return;
      }

      // Verify integrity
      const isValid = await this.encryptionService.verifyEncryptionIntegrity(encryptedData);

      ResponseHelper.success(res, {
        isValid,
        verifiedAt: new Date().toISOString()
      }, isValid ? 'Encryption integrity verified' : 'Encryption integrity verification failed');

    } catch (error) {
      Logger.error('Error verifying encryption integrity:', error);
      ResponseHelper.internalError(res, 'Error verifying encryption integrity');
    }
  };

  /**
   * Generate encryption audit log
   */
  public generateAuditLog = async (req: Request, res: Response): Promise<void> => {
    try {
      const userId = (req as any).user?.id;
      const { operation, pedidoId } = req.body;

      if (!userId) {
        ResponseHelper.unauthorized(res, 'User not authenticated');
        return;
      }

      // Generate audit log
      const auditLog = await this.encryptionService.generateEncryptionAuditLog(
        operation,
        pedidoId,
        userId
      );

      ResponseHelper.success(res, {
        auditLog,
        generatedAt: new Date().toISOString()
      }, 'Audit log generated successfully');

    } catch (error) {
      Logger.error('Error generating audit log:', error);
      ResponseHelper.internalError(res, 'Error generating audit log');
    }
  };
}
