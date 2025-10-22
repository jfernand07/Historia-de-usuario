import { Router } from 'express';
import { EncryptionController } from '../controllers/EncryptionController';
import { AuthMiddleware } from '../middlewares/AuthMiddleware';
import { ValidationMiddleware } from '../middlewares/ValidationMiddleware';
import Joi from 'joi';

const router = Router();
const encryptionController = new EncryptionController();
const authMiddleware = new AuthMiddleware();

// Validation schemas for encryption endpoints
const encryptionSchemas = {
  generateKeyPair: Joi.object({}),
  
  encryptData: Joi.object({
    data: Joi.any().required(),
    publicKey: Joi.string().required()
  }),
  
  decryptData: Joi.object({
    encryptedData: Joi.string().required(),
    encryptedKey: Joi.string().required(),
    iv: Joi.string().required(),
    privateKey: Joi.string().required()
  }),
  
  encryptUserInfo: Joi.object({
    userData: Joi.object().required(),
    publicKey: Joi.string().required()
  }),
  
  decryptUserInfo: Joi.object({
    encryptedData: Joi.string().required(),
    encryptedKey: Joi.string().required(),
    iv: Joi.string().required(),
    privateKey: Joi.string().required()
  }),
  
  hashData: Joi.object({
    data: Joi.string().required()
  }),
  
  generateRandom: Joi.object({
    length: Joi.number().integer().min(8).max(256).optional()
  })
};

/**
 * @swagger
 * components:
 *   schemas:
 *     KeyPairResponse:
 *       type: object
 *       properties:
 *         success:
 *           type: boolean
 *           example: true
 *         data:
 *           type: object
 *           properties:
 *             publicKey:
 *               type: string
 *               example: -----BEGIN PUBLIC KEY-----\nMIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEA...
 *             privateKey:
 *               type: string
 *               example: -----BEGIN PRIVATE KEY-----\nMIIEvgIBADANBgkqhkiG9w0BAQEFAASCBKgwggSkAgEAAoIBAQC...
 *             algorithm:
 *               type: string
 *               example: RSA-2048
 *             format:
 *               type: string
 *               example: PEM
 *         message:
 *           type: string
 *           example: RSA key pair generated successfully
 *     EncryptionResponse:
 *       type: object
 *       properties:
 *         success:
 *           type: boolean
 *           example: true
 *         data:
 *           type: object
 *           properties:
 *             encryptedData:
 *               type: string
 *               example: a1b2c3d4e5f6...
 *             encryptedKey:
 *               type: string
 *               example: 9f8e7d6c5b4a...
 *             iv:
 *               type: string
 *               example: 1a2b3c4d5e6f...
 *             algorithm:
 *               type: string
 *               example: AES-256-GCM + RSA-2048
 *         message:
 *           type: string
 *           example: Data encrypted successfully
 *     DecryptionResponse:
 *       type: object
 *       properties:
 *         success:
 *           type: boolean
 *           example: true
 *         data:
 *           type: object
 *           properties:
 *             decryptedData:
 *               type: object
 *               example: {"sensitive": "data"}
 *             algorithm:
 *               type: string
 *               example: AES-256-GCM + RSA-2048
 *         message:
 *           type: string
 *           example: Data decrypted successfully
 */

/**
 * @swagger
 * /encryption/keypair:
 *   post:
 *     summary: Generate RSA key pair
 *     tags: [Encryption]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: RSA key pair generated successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/KeyPairResponse'
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 *       500:
 *         description: Internal server error
 */
router.post('/keypair',
  authMiddleware.verifyToken,
  authMiddleware.requireAdmin,
  ValidationMiddleware.validateBody(encryptionSchemas.generateKeyPair),
  encryptionController.generateKeyPair
);

/**
 * @swagger
 * /encryption/encrypt:
 *   post:
 *     summary: Encrypt data using hybrid encryption (AES-256-GCM + RSA-2048)
 *     tags: [Encryption]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - data
 *               - publicKey
 *             properties:
 *               data:
 *                 type: object
 *                 example: {"sensitive": "information"}
 *               publicKey:
 *                 type: string
 *                 example: -----BEGIN PUBLIC KEY-----\nMIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEA...
 *     responses:
 *       200:
 *         description: Data encrypted successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/EncryptionResponse'
 *       400:
 *         description: Validation error
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Internal server error
 */
router.post('/encrypt',
  authMiddleware.verifyToken,
  authMiddleware.requireAdminOrVendedor,
  ValidationMiddleware.validateBody(encryptionSchemas.encryptData),
  encryptionController.encryptData
);

/**
 * @swagger
 * /encryption/decrypt:
 *   post:
 *     summary: Decrypt data using hybrid decryption
 *     tags: [Encryption]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - encryptedData
 *               - encryptedKey
 *               - iv
 *               - privateKey
 *             properties:
 *               encryptedData:
 *                 type: string
 *                 example: a1b2c3d4e5f6...
 *               encryptedKey:
 *                 type: string
 *                 example: 9f8e7d6c5b4a...
 *               iv:
 *                 type: string
 *                 example: 1a2b3c4d5e6f...
 *               privateKey:
 *                 type: string
 *                 example: -----BEGIN PRIVATE KEY-----\nMIIEvgIBADANBgkqhkiG9w0BAQEFAASCBKgwggSkAgEAAoIBAQC...
 *     responses:
 *       200:
 *         description: Data decrypted successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/DecryptionResponse'
 *       400:
 *         description: Validation error
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Internal server error
 */
router.post('/decrypt',
  authMiddleware.verifyToken,
  authMiddleware.requireAdminOrVendedor,
  ValidationMiddleware.validateBody(encryptionSchemas.decryptData),
  encryptionController.decryptData
);

/**
 * @swagger
 * /encryption/encrypt-user:
 *   post:
 *     summary: Encrypt user sensitive information
 *     tags: [Encryption]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - userData
 *               - publicKey
 *             properties:
 *               userData:
 *                 type: object
 *                 properties:
 *                   password:
 *                     type: string
 *                     example: secretpassword
 *                   email:
 *                     type: string
 *                     example: user@example.com
 *                   documento:
 *                     type: string
 *                     example: 12345678
 *               publicKey:
 *                 type: string
 *                 example: -----BEGIN PUBLIC KEY-----\nMIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEA...
 *     responses:
 *       200:
 *         description: User data encrypted successfully
 *       400:
 *         description: Validation error
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Internal server error
 */
router.post('/encrypt-user',
  authMiddleware.verifyToken,
  authMiddleware.requireAdmin,
  ValidationMiddleware.validateBody(encryptionSchemas.encryptUserInfo),
  encryptionController.encryptUserInfo
);

/**
 * @swagger
 * /encryption/decrypt-user:
 *   post:
 *     summary: Decrypt user sensitive information
 *     tags: [Encryption]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - encryptedData
 *               - encryptedKey
 *               - iv
 *               - privateKey
 *             properties:
 *               encryptedData:
 *                 type: string
 *                 example: a1b2c3d4e5f6...
 *               encryptedKey:
 *                 type: string
 *                 example: 9f8e7d6c5b4a...
 *               iv:
 *                 type: string
 *                 example: 1a2b3c4d5e6f...
 *               privateKey:
 *                 type: string
 *                 example: -----BEGIN PRIVATE KEY-----\nMIIEvgIBADANBgkqhkiG9w0BAQEFAASCBKgwggSkAgEAAoIBAQC...
 *     responses:
 *       200:
 *         description: User data decrypted successfully
 *       400:
 *         description: Validation error
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Internal server error
 */
router.post('/decrypt-user',
  authMiddleware.verifyToken,
  authMiddleware.requireAdmin,
  ValidationMiddleware.validateBody(encryptionSchemas.decryptUserInfo),
  encryptionController.decryptUserInfo
);

/**
 * @swagger
 * /encryption/hash:
 *   post:
 *     summary: Hash data using SHA-256
 *     tags: [Encryption]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - data
 *             properties:
 *               data:
 *                 type: string
 *                 example: sensitive data to hash
 *     responses:
 *       200:
 *         description: Data hashed successfully
 *       400:
 *         description: Validation error
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Internal server error
 */
router.post('/hash',
  authMiddleware.verifyToken,
  authMiddleware.requireAdminOrVendedor,
  ValidationMiddleware.validateBody(encryptionSchemas.hashData),
  encryptionController.hashData
);

/**
 * @swagger
 * /encryption/random:
 *   get:
 *     summary: Generate secure random string
 *     tags: [Encryption]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: length
 *         schema:
 *           type: number
 *           minimum: 8
 *           maximum: 256
 *           default: 32
 *         description: Length of random string
 *     responses:
 *       200:
 *         description: Secure random string generated successfully
 *       400:
 *         description: Validation error
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Internal server error
 */
router.get('/random',
  authMiddleware.verifyToken,
  authMiddleware.requireAdminOrVendedor,
  ValidationMiddleware.validateQuery(encryptionSchemas.generateRandom),
  encryptionController.generateRandom
);

export default router;
