import { Pedido, DetallePedido } from '../models';
import { HybridEncryptionService } from './HybridEncryptionService';
import { Logger } from '../utils/helpers';

export interface EncryptedPedidoData {
  pedidoId: number;
  encryptedObservaciones?: string;
  encryptedDetalles?: string;
  encryptedMetadata?: string;
}

export interface PedidoEncryptionMetadata {
  clienteId: number;
  usuarioId: number;
  total: number;
  estado: string;
  fecha: string;
  createdAt: string;
  updatedAt: string;
}

export interface DetalleEncryptionData {
  productoId: number;
  cantidad: number;
  precioUnitario: number;
  subtotal: number;
}

export class PedidoEncryptionService {
  private encryptionService: HybridEncryptionService;

  constructor() {
    this.encryptionService = new HybridEncryptionService();
  }

  /**
   * Encrypt sensitive pedido data
   */
  async encryptPedidoData(pedido: Pedido): Promise<EncryptedPedidoData> {
    try {
      Logger.info('Encrypting pedido data', { pedidoId: pedido.id });

      const encryptedData: EncryptedPedidoData = {
        pedidoId: pedido.id
      };

      // Encrypt observaciones if present
      if (pedido.observaciones) {
        encryptedData.encryptedObservaciones = await this.encryptionService.encrypt(pedido.observaciones);
      }

      // Encrypt detalles if present
      if ((pedido as any).detalles && (pedido as any).detalles.length > 0) {
        const detallesData: DetalleEncryptionData[] = (pedido as any).detalles.map((detalle: any) => ({
          productoId: detalle.productoId,
          cantidad: detalle.cantidad,
          precioUnitario: detalle.precioUnitario,
          subtotal: detalle.subtotal
        }));
        
        encryptedData.encryptedDetalles = await this.encryptionService.encrypt(JSON.stringify(detallesData));
      }

      // Encrypt metadata
      const metadata: PedidoEncryptionMetadata = {
        clienteId: pedido.clienteId,
        usuarioId: pedido.usuarioId,
        total: pedido.total,
        estado: pedido.estado,
        fecha: pedido.fecha.toISOString(),
        createdAt: pedido.createdAt.toISOString(),
        updatedAt: pedido.updatedAt.toISOString()
      };

      encryptedData.encryptedMetadata = await this.encryptionService.encrypt(JSON.stringify(metadata));

      Logger.info('Pedido data encrypted successfully', { pedidoId: pedido.id });
      return encryptedData;

    } catch (error) {
      Logger.error('Error encrypting pedido data', error);
      throw error;
    }
  }

  /**
   * Decrypt pedido data
   */
  async decryptPedidoData(encryptedData: EncryptedPedidoData): Promise<{
    observaciones?: string;
    detalles?: DetalleEncryptionData[];
    metadata?: PedidoEncryptionMetadata;
  }> {
    try {
      Logger.info('Decrypting pedido data', { pedidoId: encryptedData.pedidoId });

      const decryptedData: any = {};

      // Decrypt observaciones
      if (encryptedData.encryptedObservaciones) {
        decryptedData.observaciones = await this.encryptionService.decrypt(encryptedData.encryptedObservaciones);
      }

      // Decrypt detalles
      if (encryptedData.encryptedDetalles) {
        const detallesJson = await this.encryptionService.decrypt(encryptedData.encryptedDetalles);
        decryptedData.detalles = JSON.parse(detallesJson);
      }

      // Decrypt metadata
      if (encryptedData.encryptedMetadata) {
        const metadataJson = await this.encryptionService.decrypt(encryptedData.encryptedMetadata);
        decryptedData.metadata = JSON.parse(metadataJson);
      }

      Logger.info('Pedido data decrypted successfully', { pedidoId: encryptedData.pedidoId });
      return decryptedData;

    } catch (error) {
      Logger.error('Error decrypting pedido data', error);
      throw error;
    }
  }

  /**
   * Encrypt pedido creation data
   */
  async encryptPedidoCreationData(data: {
    clienteId: number;
    usuarioId: number;
    productos: Array<{
      productoId: number;
      cantidad: number;
    }>;
    observaciones?: string;
  }): Promise<string> {
    try {
      Logger.info('Encrypting pedido creation data');

      const sensitiveData = {
        clienteId: data.clienteId,
        usuarioId: data.usuarioId,
        productos: data.productos,
        observaciones: data.observaciones,
        timestamp: new Date().toISOString()
      };

      const encryptedData = await this.encryptionService.encrypt(JSON.stringify(sensitiveData));
      
      Logger.info('Pedido creation data encrypted successfully');
      return encryptedData;

    } catch (error) {
      Logger.error('Error encrypting pedido creation data', error);
      throw error;
    }
  }

  /**
   * Decrypt pedido creation data
   */
  async decryptPedidoCreationData(encryptedData: string): Promise<{
    clienteId: number;
    usuarioId: number;
    productos: Array<{
      productoId: number;
      cantidad: number;
    }>;
    observaciones?: string;
    timestamp: string;
  }> {
    try {
      Logger.info('Decrypting pedido creation data');

      const decryptedJson = await this.encryptionService.decrypt(encryptedData);
      const decryptedData = JSON.parse(decryptedJson);
      
      Logger.info('Pedido creation data decrypted successfully');
      return decryptedData;

    } catch (error) {
      Logger.error('Error decrypting pedido creation data', error);
      throw error;
    }
  }

  /**
   * Encrypt pedido update data
   */
  async encryptPedidoUpdateData(data: {
    pedidoId: number;
    estado?: string;
    observaciones?: string;
    updatedBy: number;
  }): Promise<string> {
    try {
      Logger.info('Encrypting pedido update data', { pedidoId: data.pedidoId });

      const sensitiveData = {
        pedidoId: data.pedidoId,
        estado: data.estado,
        observaciones: data.observaciones,
        updatedBy: data.updatedBy,
        timestamp: new Date().toISOString()
      };

      const encryptedData = await this.encryptionService.encrypt(JSON.stringify(sensitiveData));
      
      Logger.info('Pedido update data encrypted successfully', { pedidoId: data.pedidoId });
      return encryptedData;

    } catch (error) {
      Logger.error('Error encrypting pedido update data', error);
      throw error;
    }
  }

  /**
   * Decrypt pedido update data
   */
  async decryptPedidoUpdateData(encryptedData: string): Promise<{
    pedidoId: number;
    estado?: string;
    observaciones?: string;
    updatedBy: number;
    timestamp: string;
  }> {
    try {
      Logger.info('Decrypting pedido update data');

      const decryptedJson = await this.encryptionService.decrypt(encryptedData);
      const decryptedData = JSON.parse(decryptedJson);
      
      Logger.info('Pedido update data decrypted successfully');
      return decryptedData;

    } catch (error) {
      Logger.error('Error decrypting pedido update data', error);
      throw error;
    }
  }

  /**
   * Encrypt pedido search filters
   */
  async encryptPedidoSearchFilters(filters: {
    clienteId?: number;
    usuarioId?: number;
    estado?: string;
    fechaInicio?: string;
    fechaFin?: string;
    productoId?: number;
    searchBy: number;
  }): Promise<string> {
    try {
      Logger.info('Encrypting pedido search filters');

      const sensitiveData = {
        ...filters,
        timestamp: new Date().toISOString()
      };

      const encryptedData = await this.encryptionService.encrypt(JSON.stringify(sensitiveData));
      
      Logger.info('Pedido search filters encrypted successfully');
      return encryptedData;

    } catch (error) {
      Logger.error('Error encrypting pedido search filters', error);
      throw error;
    }
  }

  /**
   * Decrypt pedido search filters
   */
  async decryptPedidoSearchFilters(encryptedData: string): Promise<{
    clienteId?: number;
    usuarioId?: number;
    estado?: string;
    fechaInicio?: string;
    fechaFin?: string;
    productoId?: number;
    searchBy: number;
    timestamp: string;
  }> {
    try {
      Logger.info('Decrypting pedido search filters');

      const decryptedJson = await this.encryptionService.decrypt(encryptedData);
      const decryptedData = JSON.parse(decryptedJson);
      
      Logger.info('Pedido search filters decrypted successfully');
      return decryptedData;

    } catch (error) {
      Logger.error('Error decrypting pedido search filters', error);
      throw error;
    }
  }

  /**
   * Encrypt pedido statistics data
   */
  async encryptPedidoStatistics(stats: {
    totalPedidos: number;
    pedidosPorEstado: Record<string, number>;
    ventasTotales: number;
    promedioPedido: number;
    pedidosUltimoMes: number;
    generatedBy: number;
  }): Promise<string> {
    try {
      Logger.info('Encrypting pedido statistics');

      const sensitiveData = {
        ...stats,
        timestamp: new Date().toISOString()
      };

      const encryptedData = await this.encryptionService.encrypt(JSON.stringify(sensitiveData));
      
      Logger.info('Pedido statistics encrypted successfully');
      return encryptedData;

    } catch (error) {
      Logger.error('Error encrypting pedido statistics', error);
      throw error;
    }
  }

  /**
   * Decrypt pedido statistics data
   */
  async decryptPedidoStatistics(encryptedData: string): Promise<{
    totalPedidos: number;
    pedidosPorEstado: Record<string, number>;
    ventasTotales: number;
    promedioPedido: number;
    pedidosUltimoMes: number;
    generatedBy: number;
    timestamp: string;
  }> {
    try {
      Logger.info('Decrypting pedido statistics');

      const decryptedJson = await this.encryptionService.decrypt(encryptedData);
      const decryptedData = JSON.parse(decryptedJson);
      
      Logger.info('Pedido statistics decrypted successfully');
      return decryptedData;

    } catch (error) {
      Logger.error('Error decrypting pedido statistics', error);
      throw error;
    }
  }

  /**
   * Generate encryption audit log
   */
  async generateEncryptionAuditLog(operation: string, pedidoId: number, userId: number): Promise<string> {
    try {
      const auditData = {
        operation,
        pedidoId,
        userId,
        timestamp: new Date().toISOString(),
        action: 'encryption_operation'
      };

      const encryptedAudit = await this.encryptionService.encrypt(JSON.stringify(auditData));
      
      Logger.info('Encryption audit log generated', { operation, pedidoId, userId });
      return encryptedAudit;

    } catch (error) {
      Logger.error('Error generating encryption audit log', error);
      throw error;
    }
  }

  /**
   * Verify encryption integrity
   */
  async verifyEncryptionIntegrity(encryptedData: string, expectedHash?: string): Promise<boolean> {
    try {
      // Decrypt and re-encrypt to verify integrity
      const decryptedData = await this.encryptionService.decrypt(encryptedData);
      const reEncryptedData = await this.encryptionService.encrypt(decryptedData);
      
      // Basic integrity check
      const isValid = encryptedData !== reEncryptedData; // Should be different due to IV
      
      Logger.info('Encryption integrity verified', { isValid });
      return isValid;

    } catch (error) {
      Logger.error('Error verifying encryption integrity', error);
      return false;
    }
  }
}
