import { Router } from 'express';
import { ClienteController } from '../controllers/ClienteController';
import { AuthMiddleware } from '../middlewares/AuthMiddleware';
import { ValidationMiddleware } from '../middlewares/ValidationMiddleware';
import { clientSchemas } from '../dto/validationSchemas';

const router = Router();
const clienteController = new ClienteController();
const authMiddleware = new AuthMiddleware();

/**
 * @swagger
 * components:
 *   schemas:
 *     Cliente:
 *       type: object
 *       properties:
 *         id:
 *           type: number
 *           example: 1
 *         nombre:
 *           type: string
 *           example: Juan Pérez
 *         email:
 *           type: string
 *           format: email
 *           example: juan@example.com
 *         telefono:
 *           type: string
 *           example: +57 300 123 4567
 *         direccion:
 *           type: string
 *           example: Calle 123 #45-67, Bogotá
 *         documento:
 *           type: string
 *           example: 12345678
 *         tipoDocumento:
 *           type: string
 *           enum: [cedula, pasaporte, nit]
 *           example: cedula
 *         activo:
 *           type: boolean
 *           example: true
 *         createdAt:
 *           type: string
 *           format: date-time
 *         updatedAt:
 *           type: string
 *           format: date-time
 *     ClienteCreateRequest:
 *       type: object
 *       required:
 *         - nombre
 *         - email
 *         - documento
 *       properties:
 *         nombre:
 *           type: string
 *           example: Juan Pérez
 *         email:
 *           type: string
 *           format: email
 *           example: juan@example.com
 *         telefono:
 *           type: string
 *           example: +57 300 123 4567
 *         direccion:
 *           type: string
 *           example: Calle 123 #45-67, Bogotá
 *         documento:
 *           type: string
 *           example: 12345678
 *         tipoDocumento:
 *           type: string
 *           enum: [cedula, pasaporte, nit]
 *           example: cedula
 *         activo:
 *           type: boolean
 *           example: true
 *     ClienteUpdateRequest:
 *       type: object
 *       properties:
 *         nombre:
 *           type: string
 *           example: Juan Carlos Pérez
 *         email:
 *           type: string
 *           format: email
 *           example: juancarlos@example.com
 *         telefono:
 *           type: string
 *           example: +57 300 987 6543
 *         direccion:
 *           type: string
 *           example: Calle 456 #78-90, Medellín
 *         documento:
 *           type: string
 *           example: 87654321
 *         tipoDocumento:
 *           type: string
 *           enum: [cedula, pasaporte, nit]
 *           example: cedula
 *         activo:
 *           type: boolean
 *           example: true
 *     ClienteListResponse:
 *       type: object
 *       properties:
 *         success:
 *           type: boolean
 *           example: true
 *         data:
 *           type: object
 *           properties:
 *             clientes:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Cliente'
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
 *           example: Clientes retrieved successfully
 */

/**
 * @swagger
 * /clientes:
 *   get:
 *     summary: Get all clientes with filters and pagination
 *     tags: [Clientes]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: tipoDocumento
 *         schema:
 *           type: string
 *           enum: [cedula, pasaporte, nit]
 *         description: Filter by document type
 *       - in: query
 *         name: activo
 *         schema:
 *           type: boolean
 *         description: Filter by active status
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         description: Search by name, email, or document
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
 *         description: Clientes retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ClienteListResponse'
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Internal server error
 */
router.get('/', 
  authMiddleware.verifyToken,
  authMiddleware.requireAdminOrVendedor,
  ValidationMiddleware.validateQuery(clientSchemas.filters),
  clienteController.getAllClientes
);

/**
 * @swagger
 * /clientes/{id}:
 *   get:
 *     summary: Get cliente by ID
 *     tags: [Clientes]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: number
 *         description: Cliente ID
 *     responses:
 *       200:
 *         description: Cliente retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   $ref: '#/components/schemas/Cliente'
 *                 message:
 *                   type: string
 *                   example: Cliente retrieved successfully
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Cliente not found
 *       500:
 *         description: Internal server error
 */
router.get('/:id',
  authMiddleware.verifyToken,
  authMiddleware.requireAdminOrVendedor,
  ValidationMiddleware.validateParams(clientSchemas.params),
  clienteController.getClienteById
);

/**
 * @swagger
 * /clientes/documento/{documento}:
 *   get:
 *     summary: Get cliente by document
 *     tags: [Clientes]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: documento
 *         required: true
 *         schema:
 *           type: string
 *         description: Cliente document number
 *     responses:
 *       200:
 *         description: Cliente retrieved successfully
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Cliente not found
 *       500:
 *         description: Internal server error
 */
router.get('/documento/:documento',
  authMiddleware.verifyToken,
  authMiddleware.requireAdminOrVendedor,
  clienteController.getClienteByDocument
);

/**
 * @swagger
 * /clientes:
 *   post:
 *     summary: Create new cliente
 *     tags: [Clientes]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/ClienteCreateRequest'
 *     responses:
 *       201:
 *         description: Cliente created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   $ref: '#/components/schemas/Cliente'
 *                 message:
 *                   type: string
 *                   example: Cliente created successfully
 *       400:
 *         description: Validation error
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 *       409:
 *         description: Document or email already exists
 *       500:
 *         description: Internal server error
 */
router.post('/',
  authMiddleware.verifyToken,
  authMiddleware.requireAdminOrVendedor,
  ValidationMiddleware.validateBody(clientSchemas.create),
  clienteController.createCliente
);

/**
 * @swagger
 * /clientes/{id}:
 *   put:
 *     summary: Update cliente
 *     tags: [Clientes]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: number
 *         description: Cliente ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/ClienteUpdateRequest'
 *     responses:
 *       200:
 *         description: Cliente updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   $ref: '#/components/schemas/Cliente'
 *                 message:
 *                   type: string
 *                   example: Cliente updated successfully
 *       400:
 *         description: Validation error
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 *       404:
 *         description: Cliente not found
 *       409:
 *         description: Document or email already exists
 *       500:
 *         description: Internal server error
 */
router.put('/:id',
  authMiddleware.verifyToken,
  authMiddleware.requireAdminOrVendedor,
  ValidationMiddleware.validateParams(clientSchemas.params),
  ValidationMiddleware.validateBody(clientSchemas.update),
  clienteController.updateCliente
);

/**
 * @swagger
 * /clientes/{id}:
 *   delete:
 *     summary: Delete cliente (soft delete)
 *     tags: [Clientes]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: number
 *         description: Cliente ID
 *     responses:
 *       200:
 *         description: Cliente deleted successfully
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 *       404:
 *         description: Cliente not found
 *       500:
 *         description: Internal server error
 */
router.delete('/:id',
  authMiddleware.verifyToken,
  authMiddleware.requireAdminOrVendedor,
  ValidationMiddleware.validateParams(clientSchemas.params),
  clienteController.deleteCliente
);

/**
 * @swagger
 * /clientes/tipo-documento/{tipoDocumento}:
 *   get:
 *     summary: Get clientes by document type
 *     tags: [Clientes]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: tipoDocumento
 *         required: true
 *         schema:
 *           type: string
 *           enum: [cedula, pasaporte, nit]
 *         description: Document type
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
 *         description: Clientes by document type retrieved successfully
 *       400:
 *         description: Validation error
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Internal server error
 */
router.get('/tipo-documento/:tipoDocumento',
  authMiddleware.verifyToken,
  authMiddleware.requireAdminOrVendedor,
  clienteController.getClientesByDocumentType
);

/**
 * @swagger
 * /clientes/search:
 *   get:
 *     summary: Search clientes
 *     tags: [Clientes]
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
  clienteController.searchClientes
);

/**
 * @swagger
 * /clientes/statistics:
 *   get:
 *     summary: Get cliente statistics
 *     tags: [Clientes]
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
  clienteController.getClienteStatistics
);

/**
 * @swagger
 * /clientes/recent:
 *   get:
 *     summary: Get recent clientes
 *     tags: [Clientes]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: days
 *         schema:
 *           type: number
 *           minimum: 1
 *           default: 30
 *         description: Number of days to look back
 *       - in: query
 *         name: limit
 *         schema:
 *           type: number
 *           minimum: 1
 *           maximum: 100
 *           default: 10
 *         description: Maximum number of results
 *     responses:
 *       200:
 *         description: Recent clientes retrieved successfully
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Internal server error
 */
router.get('/recent',
  authMiddleware.verifyToken,
  authMiddleware.requireAdminOrVendedor,
  clienteController.getRecentClientes
);

export default router;
