import crypto from 'crypto';
import { config } from '../config';
import { Logger } from '../utils/helpers';

export interface EncryptionResult {
  encryptedData: string;
  encryptedKey: string;
  iv: string;
}

export interface DecryptionResult {
  decryptedData: string;
}

export class HybridEncryptionService {
  private readonly algorithm = 'aes-256-gcm';
  private readonly keyLength = 32; // 256 bits
  private readonly ivLength = 16; // 128 bits
  private readonly tagLength = 16; // 128 bits

  /**
   * Generate RSA key pair
   */
  public generateRSAKeyPair(): { publicKey: string; privateKey: string } {
    try {
      const { publicKey, privateKey } = crypto.generateKeyPairSync('rsa', {
        modulusLength: 2048,
        publicKeyEncoding: {
          type: 'spki',
          format: 'pem'
        },
        privateKeyEncoding: {
          type: 'pkcs8',
          format: 'pem'
        }
      });

      Logger.info('RSA key pair generated successfully');
      
      return {
        publicKey,
        privateKey
      };
    } catch (error) {
      Logger.error('Error generating RSA key pair:', error);
      throw new Error('Failed to generate RSA key pair');
    }
  }

  /**
   * Generate AES key
   */
  public generateAESKey(): string {
    try {
      const key = crypto.randomBytes(this.keyLength);
      return key.toString('hex');
    } catch (error) {
      Logger.error('Error generating AES key:', error);
      throw new Error('Failed to generate AES key');
    }
  }

  /**
   * Encrypt data with AES-256-GCM
   */
  public encryptWithAES(data: string, aesKey: string): { encryptedData: string; iv: string; tag: string } {
    try {
      const key = Buffer.from(aesKey, 'hex');
      const iv = crypto.randomBytes(this.ivLength);
      
      const cipher = crypto.createCipher(this.algorithm, key);
      cipher.setAAD(Buffer.from('sportsline-api', 'utf8'));
      
      let encrypted = cipher.update(data, 'utf8', 'hex');
      encrypted += cipher.final('hex');
      
      const tag = cipher.getAuthTag();

      return {
        encryptedData: encrypted,
        iv: iv.toString('hex'),
        tag: tag.toString('hex')
      };
    } catch (error) {
      Logger.error('Error encrypting with AES:', error);
      throw new Error('Failed to encrypt data with AES');
    }
  }

  /**
   * Decrypt data with AES-256-GCM
   */
  public decryptWithAES(encryptedData: string, aesKey: string, iv: string, tag: string): string {
    try {
      const key = Buffer.from(aesKey, 'hex');
      const ivBuffer = Buffer.from(iv, 'hex');
      const tagBuffer = Buffer.from(tag, 'hex');
      
      const decipher = crypto.createDecipher(this.algorithm, key);
      decipher.setAAD(Buffer.from('sportsline-api', 'utf8'));
      decipher.setAuthTag(tagBuffer);
      
      let decrypted = decipher.update(encryptedData, 'hex', 'utf8');
      decrypted += decipher.final('utf8');
      
      return decrypted;
    } catch (error) {
      Logger.error('Error decrypting with AES:', error);
      throw new Error('Failed to decrypt data with AES');
    }
  }

  /**
   * Encrypt AES key with RSA public key
   */
  public encryptAESKeyWithRSA(aesKey: string, rsaPublicKey: string): string {
    try {
      const encrypted = crypto.publicEncrypt(
        {
          key: rsaPublicKey,
          padding: crypto.constants.RSA_PKCS1_OAEP_PADDING,
          oaepHash: 'sha256'
        },
        Buffer.from(aesKey, 'hex')
      );
      
      return encrypted.toString('hex');
    } catch (error) {
      Logger.error('Error encrypting AES key with RSA:', error);
      throw new Error('Failed to encrypt AES key with RSA');
    }
  }

  /**
   * Decrypt AES key with RSA private key
   */
  public decryptAESKeyWithRSA(encryptedAESKey: string, rsaPrivateKey: string): string {
    try {
      const decrypted = crypto.privateDecrypt(
        {
          key: rsaPrivateKey,
          padding: crypto.constants.RSA_PKCS1_OAEP_PADDING,
          oaepHash: 'sha256'
        },
        Buffer.from(encryptedAESKey, 'hex')
      );
      
      return decrypted.toString('hex');
    } catch (error) {
      Logger.error('Error decrypting AES key with RSA:', error);
      throw new Error('Failed to decrypt AES key with RSA');
    }
  }

  /**
   * Hybrid encryption: Encrypt data with AES, then encrypt AES key with RSA
   */
  public hybridEncrypt(data: string, rsaPublicKey: string): EncryptionResult {
    try {
      // Generate AES key
      const aesKey = this.generateAESKey();
      
      // Encrypt data with AES
      const aesResult = this.encryptWithAES(data, aesKey);
      
      // Encrypt AES key with RSA
      const encryptedAESKey = this.encryptAESKeyWithRSA(aesKey, rsaPublicKey);
      
      Logger.info('Data encrypted using hybrid encryption');
      
      return {
        encryptedData: aesResult.encryptedData,
        encryptedKey: encryptedAESKey,
        iv: aesResult.iv
      };
    } catch (error) {
      Logger.error('Error in hybrid encryption:', error);
      throw new Error('Failed to perform hybrid encryption');
    }
  }

  /**
   * Hybrid decryption: Decrypt AES key with RSA, then decrypt data with AES
   */
  public hybridDecrypt(encryptedData: string, encryptedKey: string, iv: string, rsaPrivateKey: string): DecryptionResult {
    try {
      // Decrypt AES key with RSA
      const aesKey = this.decryptAESKeyWithRSA(encryptedKey, rsaPrivateKey);
      
      // Decrypt data with AES
      const decryptedData = this.decryptWithAES(encryptedData, aesKey, iv, '');
      
      Logger.info('Data decrypted using hybrid decryption');
      
      return {
        decryptedData
      };
    } catch (error) {
      Logger.error('Error in hybrid decryption:', error);
      throw new Error('Failed to perform hybrid decryption');
    }
  }

  /**
   * Encrypt sensitive user data
   */
  public encryptUserData(userData: any, rsaPublicKey: string): EncryptionResult {
    try {
      const sensitiveFields = ['password', 'email', 'documento'];
      const dataToEncrypt: any = {};
      
      // Extract sensitive fields
      for (const field of sensitiveFields) {
        if (userData[field]) {
          dataToEncrypt[field] = userData[field];
        }
      }
      
      if (Object.keys(dataToEncrypt).length === 0) {
        throw new Error('No sensitive data found to encrypt');
      }
      
      const jsonData = JSON.stringify(dataToEncrypt);
      return this.hybridEncrypt(jsonData, rsaPublicKey);
    } catch (error) {
      Logger.error('Error encrypting user data:', error);
      throw new Error('Failed to encrypt user data');
    }
  }

  /**
   * Decrypt sensitive user data
   */
  public decryptUserData(encryptedData: string, encryptedKey: string, iv: string, rsaPrivateKey: string): any {
    try {
      const result = this.hybridDecrypt(encryptedData, encryptedKey, iv, rsaPrivateKey);
      return JSON.parse(result.decryptedData);
    } catch (error) {
      Logger.error('Error decrypting user data:', error);
      throw new Error('Failed to decrypt user data');
    }
  }

  /**
   * Hash data with SHA-256
   */
  public hashData(data: string): string {
    try {
      return crypto.createHash('sha256').update(data).digest('hex');
    } catch (error) {
      Logger.error('Error hashing data:', error);
      throw new Error('Failed to hash data');
    }
  }

  /**
   * Generate secure random string
   */
  public generateSecureRandom(length: number = 32): string {
    try {
      return crypto.randomBytes(length).toString('hex');
    } catch (error) {
      Logger.error('Error generating secure random string:', error);
      throw new Error('Failed to generate secure random string');
    }
  }
}
