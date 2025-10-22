import { Router } from 'express';
import { UsuarioController } from '../controllers/UsuarioController';
import { AuthMiddleware } from '../middlewares/AuthMiddleware';
import { ValidationMiddleware } from '../middlewares/ValidationMiddleware';
import { authSchemas } from '../dto/validationSchemas';

const router = Router();
const usuarioController = new UsuarioController();
const authMiddleware = new AuthMiddleware();

/**
 * @swagger
 * components:
 *   schemas:
 *     Usuario:
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
 *           example: juan@sportsline.com
 *         rol:
 *           type: string
 *           enum: [admin, vendedor]
 *           example: vendedor
 *         activo:
 *           type: boolean
 *           example: true
 *         createdAt:
 *           type: string
 *           format: date-time
 *         updatedAt:
 *           type: string
 *           format: date-time
 *     UsuarioCreateRequest:
 *       type: object
 *       required:
 *         - nombre
 *         - email
 *         - password
 *       properties:
 *         nombre:
 *           type: string
 *           example: Juan Pérez
 *         email:
 *           type: string
 *           format: email
 *           example: juan@sportsline.com
 *         password:
 *           type: string
 *           example: password123
 *         rol:
 *           type: string
 *           enum: [admin, vendedor]
 *           example: vendedor
 *         activo:
 *           type: boolean
 *           example: true
 *     UsuarioUpdateRequest:
 *       type: object
 *       properties:
 *         nombre:
 *           type: string
 *           example: Juan Carlos Pérez
 *         email:
 *           type: string
 *           format: email
 *           example: juancarlos@sportsline.com
 *         password:
 *           type: string
 *           example: newpassword123
 *         rol:
 *           type: string
 *           enum: [admin, vendedor]
 *           example: admin
 *         activo:
 *           type: boolean
 *           example: true
 *     UsuarioListResponse:
 *       type: object
 *       properties:
 *         success:
 *           type: boolean
 *           example: true
 *         data:
 *           type: object
 *           properties:
 *             usuarios:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Usuario'
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
 *           example: Usuarios retrieved successfully
 */

/**
 * @swagger
 * /usuarios:
 *   get:
 *     summary: Get all usuarios with filters and pagination
 *     tags: [Usuarios]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: rol
 *         schema:
 *           type: string
 *           enum: [admin, vendedor]
 *         description: Filter by role
 *       - in: query
 *         name: activo
 *         schema:
 *           type: boolean
 *         description: Filter by active status
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         description: Search by name or email
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
 *         description: Usuarios retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/UsuarioListResponse'
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 *       500:
 *         description: Internal server error
 */
router.get('/', 
  authMiddleware.verifyToken,
  authMiddleware.requireAdmin,
  ValidationMiddleware.validateQuery(authSchemas.usuarioFilters),
  usuarioController.getAllUsuarios
);

/**
 * @swagger
 * /usuarios/{id}:
 *   get:
 *     summary: Get usuario by ID
 *     tags: [Usuarios]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: number
 *         description: Usuario ID
 *     responses:
 *       200:
 *         description: Usuario retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   $ref: '#/components/schemas/Usuario'
 *                 message:
 *                   type: string
 *                   example: Usuario retrieved successfully
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Usuario not found
 *       500:
 *         description: Internal server error
 */
router.get('/:id',
  authMiddleware.verifyToken,
  authMiddleware.requireAdminOrVendedor,
  ValidationMiddleware.validateParams(authSchemas.usuarioParams),
  usuarioController.getUsuarioById
);

/**
 * @swagger
 * /usuarios:
 *   post:
 *     summary: Create new usuario
 *     tags: [Usuarios]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/UsuarioCreateRequest'
 *     responses:
 *       201:
 *         description: Usuario created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   $ref: '#/components/schemas/Usuario'
 *                 message:
 *                   type: string
 *                   example: Usuario created successfully
 *       400:
 *         description: Validation error
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 *       409:
 *         description: Email already exists
 *       500:
 *         description: Internal server error
 */
router.post('/',
  authMiddleware.verifyToken,
  authMiddleware.requireAdmin,
  ValidationMiddleware.validateBody(authSchemas.register),
  usuarioController.createUsuario
);

/**
 * @swagger
 * /usuarios/{id}:
 *   put:
 *     summary: Update usuario
 *     tags: [Usuarios]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: number
 *         description: Usuario ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/UsuarioUpdateRequest'
 *     responses:
 *       200:
 *         description: Usuario updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   $ref: '#/components/schemas/Usuario'
 *                 message:
 *                   type: string
 *                   example: Usuario updated successfully
 *       400:
 *         description: Validation error
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 *       404:
 *         description: Usuario not found
 *       409:
 *         description: Email already exists
 *       500:
 *         description: Internal server error
 */
router.put('/:id',
  authMiddleware.verifyToken,
  authMiddleware.requireAdmin,
  ValidationMiddleware.validateParams(authSchemas.usuarioParams),
  ValidationMiddleware.validateBody(authSchemas.updateProfile),
  usuarioController.updateUsuario
);

/**
 * @swagger
 * /usuarios/{id}:
 *   delete:
 *     summary: Delete usuario (soft delete)
 *     tags: [Usuarios]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: number
 *         description: Usuario ID
 *     responses:
 *       200:
 *         description: Usuario deleted successfully
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 *       404:
 *         description: Usuario not found
 *       500:
 *         description: Internal server error
 */
router.delete('/:id',
  authMiddleware.verifyToken,
  authMiddleware.requireAdmin,
  ValidationMiddleware.validateParams(authSchemas.usuarioParams),
  usuarioController.deleteUsuario
);

/**
 * @swagger
 * /usuarios/statistics:
 *   get:
 *     summary: Get usuario statistics
 *     tags: [Usuarios]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Statistics retrieved successfully
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
 *                     total:
 *                       type: number
 *                       example: 25
 *                     active:
 *                       type: number
 *                       example: 23
 *                     inactive:
 *                       type: number
 *                       example: 2
 *                     admins:
 *                       type: number
 *                       example: 5
 *                     vendedores:
 *                       type: number
 *                       example: 20
 *                 message:
 *                   type: string
 *                   example: Usuario statistics retrieved successfully
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Internal server error
 */
router.get('/statistics',
  authMiddleware.verifyToken,
  authMiddleware.requireAdmin,
  usuarioController.getUsuarioStatistics
);

/**
 * @swagger
 * /usuarios/search:
 *   get:
 *     summary: Search usuarios
 *     tags: [Usuarios]
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
  usuarioController.searchUsuarios
);

export default router;
