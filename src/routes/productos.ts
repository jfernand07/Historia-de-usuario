import { Router } from 'express';
import { ProductoController } from '../controllers/ProductoController';
import { AuthMiddleware } from '../middlewares/AuthMiddleware';
import { ValidationMiddleware } from '../middlewares/ValidationMiddleware';
import { productSchemas } from '../dto/validationSchemas';

const router = Router();
const productoController = new ProductoController();
const authMiddleware = new AuthMiddleware();

/**
 * @swagger
 * components:
 *   schemas:
 *     Producto:
 *       type: object
 *       properties:
 *         id:
 *           type: number
 *           example: 1
 *         codigo:
 *           type: string
 *           example: PROD-001
 *         nombre:
 *           type: string
 *           example: Balón de Fútbol Nike
 *         descripcion:
 *           type: string
 *           example: Balón de fútbol oficial Nike, tamaño 5
 *         precio:
 *           type: number
 *           format: decimal
 *           example: 89.99
 *         stock:
 *           type: number
 *           example: 50
 *         categoria:
 *           type: string
 *           example: Fútbol
 *         activo:
 *           type: boolean
 *           example: true
 *         createdAt:
 *           type: string
 *           format: date-time
 *         updatedAt:
 *           type: string
 *           format: date-time
 *     ProductoCreateRequest:
 *       type: object
 *       required:
 *         - codigo
 *         - nombre
 *         - precio
 *         - stock
 *         - categoria
 *       properties:
 *         codigo:
 *           type: string
 *           example: PROD-001
 *         nombre:
 *           type: string
 *           example: Balón de Fútbol Nike
 *         descripcion:
 *           type: string
 *           example: Balón de fútbol oficial Nike, tamaño 5
 *         precio:
 *           type: number
 *           format: decimal
 *           example: 89.99
 *         stock:
 *           type: number
 *           example: 50
 *         categoria:
 *           type: string
 *           example: Fútbol
 *         activo:
 *           type: boolean
 *           example: true
 *     ProductoUpdateRequest:
 *       type: object
 *       properties:
 *         codigo:
 *           type: string
 *           example: PROD-001-UPDATED
 *         nombre:
 *           type: string
 *           example: Balón de Fútbol Nike Pro
 *         descripcion:
 *           type: string
 *           example: Balón de fútbol oficial Nike, tamaño 5, versión profesional
 *         precio:
 *           type: number
 *           format: decimal
 *           example: 99.99
 *         stock:
 *           type: number
 *           example: 75
 *         categoria:
 *           type: string
 *           example: Fútbol Profesional
 *         activo:
 *           type: boolean
 *           example: true
 *     StockUpdateRequest:
 *       type: object
 *       required:
 *         - cantidad
 *         - operacion
 *       properties:
 *         cantidad:
 *           type: number
 *           example: 10
 *         operacion:
 *           type: string
 *           enum: [add, subtract, set]
 *           example: add
 *     ProductoListResponse:
 *       type: object
 *       properties:
 *         success:
 *           type: boolean
 *           example: true
 *         data:
 *           type: object
 *           properties:
 *             productos:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Producto'
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
 *           example: Productos retrieved successfully
 */

/**
 * @swagger
 * /productos:
 *   get:
 *     summary: Get all productos with filters and pagination
 *     tags: [Productos]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: categoria
 *         schema:
 *           type: string
 *         description: Filter by category
 *       - in: query
 *         name: activo
 *         schema:
 *           type: boolean
 *         description: Filter by active status
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         description: Search by name, code, or description
 *       - in: query
 *         name: minPrecio
 *         schema:
 *           type: number
 *           format: decimal
 *         description: Minimum price filter
 *       - in: query
 *         name: maxPrecio
 *         schema:
 *           type: number
 *           format: decimal
 *         description: Maximum price filter
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
 *         description: Productos retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ProductoListResponse'
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Internal server error
 */
router.get('/', 
  authMiddleware.verifyToken,
  authMiddleware.requireAdminOrVendedor,
  ValidationMiddleware.validateQuery(productSchemas.filters),
  productoController.getAllProductos
);

/**
 * @swagger
 * /productos/{id}:
 *   get:
 *     summary: Get producto by ID
 *     tags: [Productos]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: number
 *         description: Producto ID
 *     responses:
 *       200:
 *         description: Producto retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   $ref: '#/components/schemas/Producto'
 *                 message:
 *                   type: string
 *                   example: Producto retrieved successfully
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Producto not found
 *       500:
 *         description: Internal server error
 */
router.get('/:id',
  authMiddleware.verifyToken,
  authMiddleware.requireAdminOrVendedor,
  ValidationMiddleware.validateParams(productSchemas.params),
  productoController.getProductoById
);

/**
 * @swagger
 * /productos/codigo/{codigo}:
 *   get:
 *     summary: Get producto by code
 *     tags: [Productos]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: codigo
 *         required: true
 *         schema:
 *           type: string
 *         description: Producto code
 *     responses:
 *       200:
 *         description: Producto retrieved successfully
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Producto not found
 *       500:
 *         description: Internal server error
 */
router.get('/codigo/:codigo',
  authMiddleware.verifyToken,
  authMiddleware.requireAdminOrVendedor,
  productoController.getProductoByCode
);

/**
 * @swagger
 * /productos:
 *   post:
 *     summary: Create new producto
 *     tags: [Productos]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/ProductoCreateRequest'
 *     responses:
 *       201:
 *         description: Producto created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   $ref: '#/components/schemas/Producto'
 *                 message:
 *                   type: string
 *                   example: Producto created successfully
 *       400:
 *         description: Validation error
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 *       409:
 *         description: Product code already exists
 *       500:
 *         description: Internal server error
 */
router.post('/',
  authMiddleware.verifyToken,
  authMiddleware.requireAdmin,
  ValidationMiddleware.validateBody(productSchemas.create),
  productoController.createProducto
);

/**
 * @swagger
 * /productos/{id}:
 *   put:
 *     summary: Update producto
 *     tags: [Productos]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: number
 *         description: Producto ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/ProductoUpdateRequest'
 *     responses:
 *       200:
 *         description: Producto updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   $ref: '#/components/schemas/Producto'
 *                 message:
 *                   type: string
 *                   example: Producto updated successfully
 *       400:
 *         description: Validation error
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 *       404:
 *         description: Producto not found
 *       409:
 *         description: Product code already exists
 *       500:
 *         description: Internal server error
 */
router.put('/:id',
  authMiddleware.verifyToken,
  authMiddleware.requireAdmin,
  ValidationMiddleware.validateParams(productSchemas.params),
  ValidationMiddleware.validateBody(productSchemas.update),
  productoController.updateProducto
);

/**
 * @swagger
 * /productos/{id}:
 *   delete:
 *     summary: Delete producto (soft delete)
 *     tags: [Productos]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: number
 *         description: Producto ID
 *     responses:
 *       200:
 *         description: Producto deleted successfully
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 *       404:
 *         description: Producto not found
 *       500:
 *         description: Internal server error
 */
router.delete('/:id',
  authMiddleware.verifyToken,
  authMiddleware.requireAdmin,
  ValidationMiddleware.validateParams(productSchemas.params),
  productoController.deleteProducto
);

/**
 * @swagger
 * /productos/{id}/stock:
 *   put:
 *     summary: Update producto stock
 *     tags: [Productos]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: number
 *         description: Producto ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/StockUpdateRequest'
 *     responses:
 *       200:
 *         description: Stock updated successfully
 *       400:
 *         description: Validation error
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Producto not found
 *       500:
 *         description: Internal server error
 */
router.put('/:id/stock',
  authMiddleware.verifyToken,
  authMiddleware.requireAdminOrVendedor,
  ValidationMiddleware.validateParams(productSchemas.params),
  productoController.updateStock
);

/**
 * @swagger
 * /productos/categoria/{categoria}:
 *   get:
 *     summary: Get productos by category
 *     tags: [Productos]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: categoria
 *         required: true
 *         schema:
 *           type: string
 *         description: Product category
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
 *         description: Productos by category retrieved successfully
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Internal server error
 */
router.get('/categoria/:categoria',
  authMiddleware.verifyToken,
  authMiddleware.requireAdminOrVendedor,
  productoController.getProductosByCategory
);

/**
 * @swagger
 * /productos/search:
 *   get:
 *     summary: Search productos
 *     tags: [Productos]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: q
 *         required: true
 *         schema:
 *           type: string
 *           minLength: 2
 *         description: Search term
 *     responses:
 *       200:
 *         description: Search completed successfully
 *       400:
 *         description: Validation error
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Internal server error
 */
router.get('/search',
  authMiddleware.verifyToken,
  authMiddleware.requireAdminOrVendedor,
  productoController.searchProductos
);

/**
 * @swagger
 * /productos/low-stock:
 *   get:
 *     summary: Get productos with low stock
 *     tags: [Productos]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: threshold
 *         schema:
 *           type: number
 *           minimum: 1
 *           default: 10
 *         description: Stock threshold
 *     responses:
 *       200:
 *         description: Low stock productos retrieved successfully
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Internal server error
 */
router.get('/low-stock',
  authMiddleware.verifyToken,
  authMiddleware.requireAdminOrVendedor,
  productoController.getLowStockProductos
);

/**
 * @swagger
 * /productos/statistics:
 *   get:
 *     summary: Get producto statistics
 *     tags: [Productos]
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
  productoController.getProductoStatistics
);

export default router;
