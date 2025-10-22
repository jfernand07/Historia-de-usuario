import { Router } from 'express';
import { PedidoEncryptionController } from '../controllers/PedidoEncryptionController';
import { PedidoEncryptionMiddleware } from '../middlewares/PedidoEncryptionMiddleware';
import { AuthMiddleware } from '../middlewares/AuthMiddleware';
import { ValidationMiddleware } from '../middlewares/ValidationMiddleware';

const router = Router();
const encryptionController = new PedidoEncryptionController();
const encryptionMiddleware = new PedidoEncryptionMiddleware();
const authMiddleware = new AuthMiddleware();

/**
 * @swagger
 * components:
 *   schemas:
 *     EncryptedPedidoData:
 *       type: object
 *       properties:
 *         pedidoId:
 *           type: number
 *           example: 1
 *         encryptedObservaciones:
 *           type: string
 *           example: "encrypted_observaciones_data"
 *         encryptedDetalles:
 *           type: string
 *           example: "encrypted_detalles_data"
 *         encryptedMetadata:
 *           type: string
 *           example: "encrypted_metadata_data"
 *     EncryptionRequest:
 *       type: object
 *       required:
 *         - encryptedData
 *       properties:
 *         encryptedData:
 *           type: string
 *           example: "encrypted_data_string"
 *     EncryptionResponse:
 *       type: object
 *       properties:
 *         success:
 *           type: boolean
 *           example: true
 *         data:
 *           type: object
 *         message:
 *           type: string
 *           example: "Operation completed successfully"
 */

/**
 * @swagger
 * /pedidos-encryption/{id}/encrypt:
 *   post:
 *     summary: Encrypt pedido data
 *     tags: [Pedidos Encryption]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: number
 *         description: Pedido ID
 *     responses:
 *       200:
 *         description: Pedido data encrypted successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: object
 *                   properties:
 *                     pedidoId:
 *                       type: number
 *                       example: 1
 *                     encryptedData:
 *                       $ref: '#/components/schemas/EncryptedPedidoData'
 *                     encryptedAt:
 *                       type: string
 *                       format: date-time
 *                 message:
 *                   type: string
 *                   example: Pedido data encrypted successfully
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Pedido not found
 *       500:
 *         description: Internal server error
 */
router.post('/:id/encrypt',
  authMiddleware.verifyToken,
  authMiddleware.requireAdminOrVendedor,
  ValidationMiddleware.validateId,
  encryptionController.encryptPedido
);

/**
 * @swagger
 * /pedidos-encryption/decrypt:
 *   post:
 *     summary: Decrypt pedido data
 *     tags: [Pedidos Encryption]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/EncryptionRequest'
 *     responses:
 *       200:
 *         description: Pedido data decrypted successfully
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
  encryptionController.decryptPedido
);

/**
 * @swagger
 * /pedidos-encryption/creation/encrypt:
 *   post:
 *     summary: Encrypt pedido creation data
 *     tags: [Pedidos Encryption]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - clienteId
 *               - productos
 *             properties:
 *               clienteId:
 *                 type: number
 *                 example: 1
 *               productos:
 *                 type: array
 *                 items:
 *                   type: object
 *                   properties:
 *                     productoId:
 *                       type: number
 *                       example: 1
 *                     cantidad:
 *                       type: number
 *                       example: 2
 *               observaciones:
 *                 type: string
 *                 example: "Pedido urgente"
 *     responses:
 *       200:
 *         description: Creation data encrypted successfully
 *       400:
 *         description: Validation error
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Internal server error
 */
router.post('/creation/encrypt',
  authMiddleware.verifyToken,
  authMiddleware.requireAdminOrVendedor,
  encryptionController.encryptCreationData
);

/**
 * @swagger
 * /pedidos-encryption/creation/decrypt:
 *   post:
 *     summary: Decrypt pedido creation data
 *     tags: [Pedidos Encryption]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/EncryptionRequest'
 *     responses:
 *       200:
 *         description: Creation data decrypted successfully
 *       400:
 *         description: Validation error
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Internal server error
 */
router.post('/creation/decrypt',
  authMiddleware.verifyToken,
  authMiddleware.requireAdminOrVendedor,
  encryptionController.decryptCreationData
);

/**
 * @swagger
 * /pedidos-encryption/{id}/update/encrypt:
 *   post:
 *     summary: Encrypt pedido update data
 *     tags: [Pedidos Encryption]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: number
 *         description: Pedido ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               estado:
 *                 type: string
 *                 enum: [pendiente, confirmado, enviado, entregado, cancelado]
 *                 example: confirmado
 *               observaciones:
 *                 type: string
 *                 example: "Pedido confirmado"
 *     responses:
 *       200:
 *         description: Update data encrypted successfully
 *       400:
 *         description: Validation error
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Internal server error
 */
router.post('/:id/update/encrypt',
  authMiddleware.verifyToken,
  authMiddleware.requireAdminOrVendedor,
  ValidationMiddleware.validateId,
  encryptionController.encryptUpdateData
);

/**
 * @swagger
 * /pedidos-encryption/update/decrypt:
 *   post:
 *     summary: Decrypt pedido update data
 *     tags: [Pedidos Encryption]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/EncryptionRequest'
 *     responses:
 *       200:
 *         description: Update data decrypted successfully
 *       400:
 *         description: Validation error
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Internal server error
 */
router.post('/update/decrypt',
  authMiddleware.verifyToken,
  authMiddleware.requireAdminOrVendedor,
  encryptionController.decryptUpdateData
);

/**
 * @swagger
 * /pedidos-encryption/search/encrypt:
 *   post:
 *     summary: Encrypt search filters
 *     tags: [Pedidos Encryption]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               clienteId:
 *                 type: number
 *                 example: 1
 *               usuarioId:
 *                 type: number
 *                 example: 1
 *               estado:
 *                 type: string
 *                 enum: [pendiente, confirmado, enviado, entregado, cancelado]
 *                 example: pendiente
 *               fechaInicio:
 *                 type: string
 *                 format: date
 *                 example: "2024-01-01"
 *               fechaFin:
 *                 type: string
 *                 format: date
 *                 example: "2024-01-31"
 *               productoId:
 *                 type: number
 *                 example: 1
 *     responses:
 *       200:
 *         description: Search filters encrypted successfully
 *       400:
 *         description: Validation error
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Internal server error
 */
router.post('/search/encrypt',
  authMiddleware.verifyToken,
  authMiddleware.requireAdminOrVendedor,
  encryptionController.encryptSearchFilters
);

/**
 * @swagger
 * /pedidos-encryption/search/decrypt:
 *   post:
 *     summary: Decrypt search filters
 *     tags: [Pedidos Encryption]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - encryptedFilters
 *             properties:
 *               encryptedFilters:
 *                 type: string
 *                 example: "encrypted_filters_data"
 *     responses:
 *       200:
 *         description: Search filters decrypted successfully
 *       400:
 *         description: Validation error
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Internal server error
 */
router.post('/search/decrypt',
  authMiddleware.verifyToken,
  authMiddleware.requireAdminOrVendedor,
  encryptionController.decryptSearchFilters
);

/**
 * @swagger
 * /pedidos-encryption/statistics/encrypt:
 *   post:
 *     summary: Encrypt statistics data
 *     tags: [Pedidos Encryption]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               totalPedidos:
 *                 type: number
 *                 example: 150
 *               pedidosPorEstado:
 *                 type: object
 *                 example: {"pendiente": 10, "confirmado": 20}
 *               ventasTotales:
 *                 type: number
 *                 example: 50000.00
 *               promedioPedido:
 *                 type: number
 *                 example: 333.33
 *               pedidosUltimoMes:
 *                 type: number
 *                 example: 45
 *     responses:
 *       200:
 *         description: Statistics encrypted successfully
 *       400:
 *         description: Validation error
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Internal server error
 */
router.post('/statistics/encrypt',
  authMiddleware.verifyToken,
  authMiddleware.requireAdminOrVendedor,
  encryptionController.encryptStatistics
);

/**
 * @swagger
 * /pedidos-encryption/statistics/decrypt:
 *   post:
 *     summary: Decrypt statistics data
 *     tags: [Pedidos Encryption]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - encryptedStatistics
 *             properties:
 *               encryptedStatistics:
 *                 type: string
 *                 example: "encrypted_statistics_data"
 *     responses:
 *       200:
 *         description: Statistics decrypted successfully
 *       400:
 *         description: Validation error
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Internal server error
 */
router.post('/statistics/decrypt',
  authMiddleware.verifyToken,
  authMiddleware.requireAdminOrVendedor,
  encryptionController.decryptStatistics
);

/**
 * @swagger
 * /pedidos-encryption/verify-integrity:
 *   post:
 *     summary: Verify encryption integrity
 *     tags: [Pedidos Encryption]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/EncryptionRequest'
 *     responses:
 *       200:
 *         description: Integrity verification completed
 *       400:
 *         description: Validation error
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Internal server error
 */
router.post('/verify-integrity',
  authMiddleware.verifyToken,
  authMiddleware.requireAdminOrVendedor,
  encryptionController.verifyIntegrity
);

/**
 * @swagger
 * /pedidos-encryption/audit-log:
 *   post:
 *     summary: Generate encryption audit log
 *     tags: [Pedidos Encryption]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - operation
 *               - pedidoId
 *             properties:
 *               operation:
 *                 type: string
 *                 example: "pedido_creation_encrypt"
 *               pedidoId:
 *                 type: number
 *                 example: 1
 *     responses:
 *       200:
 *         description: Audit log generated successfully
 *       400:
 *         description: Validation error
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Internal server error
 */
router.post('/audit-log',
  authMiddleware.verifyToken,
  authMiddleware.requireAdminOrVendedor,
  encryptionController.generateAuditLog
);

export default router;
