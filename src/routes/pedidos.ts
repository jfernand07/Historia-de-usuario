import { Router } from 'express';
import { PedidoController } from '../controllers/PedidoController';
import { AuthMiddleware } from '../middlewares/AuthMiddleware';
import { ValidationMiddleware } from '../middlewares/ValidationMiddleware';
import { orderSchemas } from '../dto/validationSchemas';

const router = Router();
const pedidoController = new PedidoController();
const authMiddleware = new AuthMiddleware();

/**
 * @swagger
 * components:
 *   schemas:
 *     Pedido:
 *       type: object
 *       properties:
 *         id:
 *           type: number
 *           example: 1
 *         clienteId:
 *           type: number
 *           example: 1
 *         usuarioId:
 *           type: number
 *           example: 1
 *         fecha:
 *           type: string
 *           format: date-time
 *           example: "2024-01-15T10:30:00Z"
 *         total:
 *           type: number
 *           format: decimal
 *           example: 299.97
 *         estado:
 *           type: string
 *           enum: [pendiente, confirmado, enviado, entregado, cancelado]
 *           example: pendiente
 *         observaciones:
 *           type: string
 *           example: "Pedido urgente"
 *         createdAt:
 *           type: string
 *           format: date-time
 *         updatedAt:
 *           type: string
 *           format: date-time
 *         detalles:
 *           type: array
 *           items:
 *             $ref: '#/components/schemas/DetallePedido'
 *     DetallePedido:
 *       type: object
 *       properties:
 *         id:
 *           type: number
 *           example: 1
 *         pedidoId:
 *           type: number
 *           example: 1
 *         productoId:
 *           type: number
 *           example: 1
 *         cantidad:
 *           type: number
 *           example: 2
 *         precioUnitario:
 *           type: number
 *           format: decimal
 *           example: 89.99
 *         subtotal:
 *           type: number
 *           format: decimal
 *           example: 179.98
 *         createdAt:
 *           type: string
 *           format: date-time
 *         updatedAt:
 *           type: string
 *           format: date-time
 *     PedidoCreateRequest:
 *       type: object
 *       required:
 *         - clienteId
 *         - productos
 *       properties:
 *         clienteId:
 *           type: number
 *           example: 1
 *         productos:
 *           type: array
 *           items:
 *             type: object
 *             required:
 *               - productoId
 *               - cantidad
 *             properties:
 *               productoId:
 *                 type: number
 *                 example: 1
 *               cantidad:
 *                 type: number
 *                 example: 2
 *         observaciones:
 *           type: string
 *           example: "Pedido urgente"
 *     PedidoEstadoUpdateRequest:
 *       type: object
 *       required:
 *         - estado
 *       properties:
 *         estado:
 *           type: string
 *           enum: [pendiente, confirmado, enviado, entregado, cancelado]
 *           example: confirmado
 *     PedidoListResponse:
 *       type: object
 *       properties:
 *         success:
 *           type: boolean
 *           example: true
 *         data:
 *           type: object
 *           properties:
 *             pedidos:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Pedido'
 *             pagination:
 *               type: object
 *               properties:
 *                 page:
 *                   type: number
 *                   example: 1
 *                 limit:
 *                   type: number
 *                   example: 10
 *                 total:
 *                   type: number
 *                   example: 25
 *                 totalPages:
 *                   type: number
 *                   example: 3
 *         message:
 *           type: string
 *           example: Pedidos retrieved successfully
 */

/**
 * @swagger
 * /pedidos:
 *   post:
 *     summary: Create new pedido with stock validation
 *     tags: [Pedidos]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/PedidoCreateRequest'
 *     responses:
 *       201:
 *         description: Pedido created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   $ref: '#/components/schemas/Pedido'
 *                 message:
 *                   type: string
 *                   example: Pedido created successfully
 *       400:
 *         description: Validation error or insufficient stock
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Cliente or producto not found
 *       500:
 *         description: Internal server error
 */
router.post('/',
  authMiddleware.verifyToken,
  authMiddleware.requireAdminOrVendedor,
  ValidationMiddleware.validateBody(orderSchemas.create),
  pedidoController.createPedido
);

/**
 * @swagger
 * /pedidos:
 *   get:
 *     summary: Get all pedidos with filters and pagination
 *     tags: [Pedidos]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: clienteId
 *         schema:
 *           type: number
 *         description: Filter by cliente ID
 *       - in: query
 *         name: usuarioId
 *         schema:
 *           type: number
 *         description: Filter by usuario ID
 *       - in: query
 *         name: estado
 *         schema:
 *           type: string
 *           enum: [pendiente, confirmado, enviado, entregado, cancelado]
 *         description: Filter by estado
 *       - in: query
 *         name: fechaInicio
 *         schema:
 *           type: string
 *           format: date
 *         description: Filter by start date
 *       - in: query
 *         name: fechaFin
 *         schema:
 *           type: string
 *           format: date
 *         description: Filter by end date
 *       - in: query
 *         name: productoId
 *         schema:
 *           type: number
 *         description: Filter by producto ID
 *       - in: query
 *         name: page
 *         schema:
 *           type: number
 *           minimum: 1
 *           default: 1
 *         description: Page number
 *       - in: query
 *         name: limit
 *         schema:
 *           type: number
 *           minimum: 1
 *           maximum: 100
 *           default: 10
 *         description: Items per page
 *     responses:
 *       200:
 *         description: Pedidos retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/PedidoListResponse'
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Internal server error
 */
router.get('/',
  authMiddleware.verifyToken,
  authMiddleware.requireAdminOrVendedor,
  ValidationMiddleware.validateQuery(orderSchemas.filters),
  pedidoController.getAllPedidos
);

/**
 * @swagger
 * /pedidos/{id}:
 *   get:
 *     summary: Get pedido by ID with detalles
 *     tags: [Pedidos]
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
 *         description: Pedido retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   $ref: '#/components/schemas/Pedido'
 *                 message:
 *                   type: string
 *                   example: Pedido retrieved successfully
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Pedido not found
 *       500:
 *         description: Internal server error
 */
router.get('/:id',
  authMiddleware.verifyToken,
  authMiddleware.requireAdminOrVendedor,
  ValidationMiddleware.validateParams(orderSchemas.params),
  pedidoController.getPedidoById
);

/**
 * @swagger
 * /pedidos/{id}/estado:
 *   put:
 *     summary: Update pedido estado
 *     tags: [Pedidos]
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
 *             $ref: '#/components/schemas/PedidoEstadoUpdateRequest'
 *     responses:
 *       200:
 *         description: Pedido estado updated successfully
 *       400:
 *         description: Validation error
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Pedido not found
 *       500:
 *         description: Internal server error
 */
router.put('/:id/estado',
  authMiddleware.verifyToken,
  authMiddleware.requireAdminOrVendedor,
  ValidationMiddleware.validateParams(orderSchemas.params),
  ValidationMiddleware.validateBody(orderSchemas.update),
  pedidoController.updatePedidoEstado
);

/**
 * @swagger
 * /pedidos/cliente/{clienteId}:
 *   get:
 *     summary: Get pedidos by cliente
 *     tags: [Pedidos]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: clienteId
 *         required: true
 *         schema:
 *           type: number
 *         description: Cliente ID
 *     responses:
 *       200:
 *         description: Pedidos by cliente retrieved successfully
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Cliente not found
 *       500:
 *         description: Internal server error
 */
router.get('/cliente/:clienteId',
  authMiddleware.verifyToken,
  authMiddleware.requireAdminOrVendedor,
  pedidoController.getPedidosByCliente
);

/**
 * @swagger
 * /pedidos/producto/{productoId}:
 *   get:
 *     summary: Get pedidos by producto
 *     tags: [Pedidos]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: productoId
 *         required: true
 *         schema:
 *           type: number
 *         description: Producto ID
 *     responses:
 *       200:
 *         description: Pedidos by producto retrieved successfully
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Producto not found
 *       500:
 *         description: Internal server error
 */
router.get('/producto/:productoId',
  authMiddleware.verifyToken,
  authMiddleware.requireAdminOrVendedor,
  pedidoController.getPedidosByProducto
);

/**
 * @swagger
 * /pedidos/date-range:
 *   get:
 *     summary: Get pedidos by date range
 *     tags: [Pedidos]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: fechaInicio
 *         required: true
 *         schema:
 *           type: string
 *           format: date
 *         description: Start date
 *       - in: query
 *         name: fechaFin
 *         required: true
 *         schema:
 *           type: string
 *           format: date
 *         description: End date
 *     responses:
 *       200:
 *         description: Pedidos by date range retrieved successfully
 *       400:
 *         description: Validation error
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Internal server error
 */
router.get('/date-range',
  authMiddleware.verifyToken,
  authMiddleware.requireAdminOrVendedor,
  ValidationMiddleware.validateDateRange,
  pedidoController.getPedidosByDateRange
);

/**
 * @swagger
 * /pedidos/statistics:
 *   get:
 *     summary: Get pedido statistics
 *     tags: [Pedidos]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Statistics retrieved successfully
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Internal server error
 */
router.get('/statistics',
  authMiddleware.verifyToken,
  authMiddleware.requireAdmin,
  pedidoController.getPedidoStatistics
);

/**
 * @swagger
 * /pedidos/{id}/cancel:
 *   put:
 *     summary: Cancel pedido and restore stock
 *     tags: [Pedidos]
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
 *         description: Pedido cancelled and stock restored successfully
 *       400:
 *         description: Pedido cannot be cancelled
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Pedido not found
 *       500:
 *         description: Internal server error
 */
router.put('/:id/cancel',
  authMiddleware.verifyToken,
  authMiddleware.requireAdminOrVendedor,
  ValidationMiddleware.validateParams(orderSchemas.params),
  pedidoController.cancelPedido
);

/**
 * @swagger
 * /pedidos/estado/{estado}:
 *   get:
 *     summary: Get pedidos by estado with pagination
 *     tags: [Pedidos]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: estado
 *         required: true
 *         schema:
 *           type: string
 *           enum: [pendiente, confirmado, enviado, entregado, cancelado]
 *         description: Estado to filter by
 *       - in: query
 *         name: page
 *         schema:
 *           type: number
 *           minimum: 1
 *           default: 1
 *         description: Page number
 *       - in: query
 *         name: limit
 *         schema:
 *           type: number
 *           minimum: 1
 *           maximum: 100
 *           default: 10
 *         description: Items per page
 *     responses:
 *       200:
 *         description: Pedidos by estado retrieved successfully
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Internal server error
 */
router.get('/estado/:estado',
  authMiddleware.verifyToken,
  authMiddleware.requireAdminOrVendedor,
  pedidoController.getPedidosByEstado
);

/**
 * @swagger
 * /pedidos/recent:
 *   get:
 *     summary: Get recent pedidos (last 30 days)
 *     tags: [Pedidos]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: limit
 *         schema:
 *           type: number
 *           minimum: 1
 *           maximum: 100
 *           default: 10
 *         description: Maximum number of pedidos to return
 *     responses:
 *       200:
 *         description: Recent pedidos retrieved successfully
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Internal server error
 */
router.get('/recent',
  authMiddleware.verifyToken,
  authMiddleware.requireAdminOrVendedor,
  pedidoController.getRecentPedidos
);

/**
 * @swagger
 * /pedidos/summary:
 *   get:
 *     summary: Get pedidos summary for dashboard
 *     tags: [Pedidos]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Pedidos summary retrieved successfully
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Internal server error
 */
router.get('/summary',
  authMiddleware.verifyToken,
  authMiddleware.requireAdminOrVendedor,
  pedidoController.getPedidosSummary
);

/**
 * @swagger
 * /pedidos/advanced-filters:
 *   get:
 *     summary: Get pedidos with advanced filters
 *     tags: [Pedidos]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: clienteId
 *         schema:
 *           type: number
 *         description: Filter by cliente ID
 *       - in: query
 *         name: usuarioId
 *         schema:
 *           type: number
 *         description: Filter by usuario ID
 *       - in: query
 *         name: estado
 *         schema:
 *           type: string
 *           enum: [pendiente, confirmado, enviado, entregado, cancelado]
 *         description: Filter by estado
 *       - in: query
 *         name: fechaInicio
 *         schema:
 *           type: string
 *           format: date
 *         description: Filter by start date
 *       - in: query
 *         name: fechaFin
 *         schema:
 *           type: string
 *           format: date
 *         description: Filter by end date
 *       - in: query
 *         name: productoId
 *         schema:
 *           type: number
 *         description: Filter by producto ID
 *       - in: query
 *         name: minTotal
 *         schema:
 *           type: number
 *         description: Minimum total amount
 *       - in: query
 *         name: maxTotal
 *         schema:
 *           type: number
 *         description: Maximum total amount
 *       - in: query
 *         name: page
 *         schema:
 *           type: number
 *           minimum: 1
 *           default: 1
 *         description: Page number
 *       - in: query
 *         name: limit
 *         schema:
 *           type: number
 *           minimum: 1
 *           maximum: 100
 *           default: 10
 *         description: Items per page
 *     responses:
 *       200:
 *         description: Pedidos with advanced filters retrieved successfully
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Internal server error
 */
router.get('/advanced-filters',
  authMiddleware.verifyToken,
  authMiddleware.requireAdminOrVendedor,
  pedidoController.getPedidosWithAdvancedFilters
);

/**
 * @swagger
 * /pedidos/by-estados:
 *   post:
 *     summary: Get pedidos by multiple estados
 *     tags: [Pedidos]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - estados
 *             properties:
 *               estados:
 *                 type: array
 *                 items:
 *                   type: string
 *                   enum: [pendiente, confirmado, enviado, entregado, cancelado]
 *                 example: ["pendiente", "confirmado"]
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: number
 *           minimum: 1
 *           default: 1
 *         description: Page number
 *       - in: query
 *         name: limit
 *         schema:
 *           type: number
 *           minimum: 1
 *           maximum: 100
 *           default: 10
 *         description: Items per page
 *     responses:
 *       200:
 *         description: Pedidos by estados retrieved successfully
 *       400:
 *         description: Validation error
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Internal server error
 */
router.post('/by-estados',
  authMiddleware.verifyToken,
  authMiddleware.requireAdminOrVendedor,
  pedidoController.getPedidosByEstados
);

/**
 * @swagger
 * /pedidos/analytics:
 *   get:
 *     summary: Get pedidos analytics
 *     tags: [Pedidos]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: period
 *         schema:
 *           type: string
 *           enum: [week, month, year]
 *           default: month
 *         description: Analytics period
 *     responses:
 *       200:
 *         description: Pedidos analytics retrieved successfully
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Internal server error
 */
router.get('/analytics',
  authMiddleware.verifyToken,
  authMiddleware.requireAdminOrVendedor,
  pedidoController.getPedidosAnalytics
);

export default router;
