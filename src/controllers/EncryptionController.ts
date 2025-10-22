import { Request, Response } from 'express';
import { HybridEncryptionService } from '../services/HybridEncryptionService';
import { ResponseHelper } from '../utils/helpers';
import { Logger } from '../utils/helpers';

export class EncryptionController {
  private encryptionService: HybridEncryptionService;

  constructor() {
    this.encryptionService = new HybridEncryptionService();
  }

  /**
   * Generate RSA key pair
   */
  public generateKeyPair = async (req: Request, res: Response): Promise<void> => {
    try {
      const keyPair = this.encryptionService.generateRSAKeyPair();
      
      ResponseHelper.success(res, {
        publicKey: keyPair.publicKey,
        privateKey: keyPair.privateKey,
        algorithm: 'RSA-2048',
        format: 'PEM'
      }, 'RSA key pair generated successfully');

    } catch (error) {
      Logger.error('Error generating key pair:', error);
      ResponseHelper.error(res, 'Error generating key pair', 500, error);
    }
  };

  /**
   * Encrypt sensitive data
   */
  public encryptData = async (req: Request, res: Response): Promise<void> => {
    try {
      const { data, publicKey } = req.body;

      if (!data || !publicKey) {
        ResponseHelper.validationError(res, 'Data and publicKey are required');
        return;
      }

      const result = this.encryptionService.hybridEncrypt(JSON.stringify(data), publicKey);
      
      ResponseHelper.success(res, {
        encryptedData: result.encryptedData,
        encryptedKey: result.encryptedKey,
        iv: result.iv,
        algorithm: 'AES-256-GCM + RSA-2048'
      }, 'Data encrypted successfully');

    } catch (error) {
      Logger.error('Error encrypting data:', error);
      ResponseHelper.error(res, 'Error encrypting data', 500, error);
    }
  };

  /**
   * Decrypt sensitive data
   */
  public decryptData = async (req: Request, res: Response): Promise<void> => {
    try {
      const { encryptedData, encryptedKey, iv, privateKey } = req.body;

      if (!encryptedData || !encryptedKey || !iv || !privateKey) {
        ResponseHelper.validationError(res, 'encryptedData, encryptedKey, iv, and privateKey are required');
        return;
      }

      const result = this.encryptionService.hybridDecrypt(encryptedData, encryptedKey, iv, privateKey);
      
      ResponseHelper.success(res, {
        decryptedData: JSON.parse(result.decryptedData),
        algorithm: 'AES-256-GCM + RSA-2048'
      }, 'Data decrypted successfully');

    } catch (error) {
      Logger.error('Error decrypting data:', error);
      ResponseHelper.error(res, 'Error decrypting data', 500, error);
    }
  };

  /**
   * Encrypt user sensitive information
   */
  public encryptUserInfo = async (req: Request, res: Response): Promise<void> => {
    try {
      const { userData, publicKey } = req.body;

      if (!userData || !publicKey) {
        ResponseHelper.validationError(res, 'userData and publicKey are required');
        return;
      }

      const result = this.encryptionService.encryptUserData(userData, publicKey);
      
      ResponseHelper.success(res, {
        encryptedData: result.encryptedData,
        encryptedKey: result.encryptedKey,
        iv: result.iv,
        encryptedFields: ['password', 'email', 'documento'],
        algorithm: 'AES-256-GCM + RSA-2048'
      }, 'User data encrypted successfully');

    } catch (error) {
      Logger.error('Error encrypting user info:', error);
      ResponseHelper.error(res, 'Error encrypting user info', 500, error);
    }
  };

  /**
   * Decrypt user sensitive information
   */
  public decryptUserInfo = async (req: Request, res: Response): Promise<void> => {
    try {
      const { encryptedData, encryptedKey, iv, privateKey } = req.body;

      if (!encryptedData || !encryptedKey || !iv || !privateKey) {
        ResponseHelper.validationError(res, 'encryptedData, encryptedKey, iv, and privateKey are required');
        return;
      }

      const result = this.encryptionService.decryptUserData(encryptedData, encryptedKey, iv, privateKey);
      
      ResponseHelper.success(res, {
        decryptedData: result,
        algorithm: 'AES-256-GCM + RSA-2048'
      }, 'User data decrypted successfully');

    } catch (error) {
      Logger.error('Error decrypting user info:', error);
      ResponseHelper.error(res, 'Error decrypting user info', 500, error);
    }
  };

  /**
   * Hash data
   */
  public hashData = async (req: Request, res: Response): Promise<void> => {
    try {
      const { data } = req.body;

      if (!data) {
        ResponseHelper.validationError(res, 'Data is required');
        return;
      }

      const hash = this.encryptionService.hashData(data);
      
      ResponseHelper.success(res, {
        hash,
        algorithm: 'SHA-256',
        originalLength: data.length
      }, 'Data hashed successfully');

    } catch (error) {
      Logger.error('Error hashing data:', error);
      ResponseHelper.error(res, 'Error hashing data', 500, error);
    }
  };

  /**
   * Generate secure random string
   */
  public generateRandom = async (req: Request, res: Response): Promise<void> => {
    try {
      const length = parseInt(req.query.length as string) || 32;
      
      if (length < 8 || length > 256) {
        ResponseHelper.validationError(res, 'Length must be between 8 and 256');
        return;
      }

      const randomString = this.encryptionService.generateSecureRandom(length);
      
      ResponseHelper.success(res, {
        randomString,
        length,
        algorithm: 'crypto.randomBytes'
      }, 'Secure random string generated successfully');

    } catch (error) {
      Logger.error('Error generating random string:', error);
      ResponseHelper.error(res, 'Error generating random string', 500, error);
    }
  };
}
