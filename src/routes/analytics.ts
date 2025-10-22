import { Router } from 'express';
import { AnalyticsController } from '../controllers/AnalyticsController';
import { AuthMiddleware } from '../middlewares/AuthMiddleware';
import { ValidationMiddleware } from '../middlewares/ValidationMiddleware';

const router = Router();
const analyticsController = new AnalyticsController();
const authMiddleware = new AuthMiddleware();

/**
 * @swagger
 * components:
 *   schemas:
 *     DashboardStatistics:
 *       type: object
 *       properties:
 *         usuarios:
 *           type: object
 *           properties:
 *             total:
 *               type: number
 *               example: 25
 *             active:
 *               type: number
 *               example: 23
 *             inactive:
 *               type: number
 *               example: 2
 *             admins:
 *               type: number
 *               example: 5
 *             vendedores:
 *               type: number
 *               example: 20
 *         productos:
 *           type: object
 *           properties:
 *             total:
 *               type: number
 *               example: 150
 *             active:
 *               type: number
 *               example: 145
 *             inactive:
 *               type: number
 *               example: 5
 *             lowStock:
 *               type: number
 *               example: 8
 *             categories:
 *               type: object
 *               example: {"Fútbol": 25, "Tenis": 20, "Running": 30}
 *             totalValue:
 *               type: number
 *               example: 125000.50
 *         clientes:
 *           type: object
 *           properties:
 *             total:
 *               type: number
 *               example: 500
 *             active:
 *               type: number
 *               example: 480
 *             inactive:
 *               type: number
 *               example: 20
 *             cedulas:
 *               type: number
 *               example: 450
 *             pasaportes:
 *               type: number
 *               example: 30
 *             nits:
 *               type: number
 *               example: 20
 *         summary:
 *           type: object
 *           properties:
 *             totalUsuarios:
 *               type: number
 *               example: 25
 *             totalProductos:
 *               type: number
 *               example: 150
 *             totalClientes:
 *               type: number
 *               example: 500
 *             lowStockProductos:
 *               type: number
 *               example: 8
 *             recentClientes:
 *               type: number
 *               example: 5
 *     GlobalSearchResponse:
 *       type: object
 *       properties:
 *         usuarios:
 *           type: array
 *           items:
 *             type: object
 *         productos:
 *           type: array
 *           items:
 *             type: object
 *         clientes:
 *           type: array
 *           items:
 *             type: object
 *         totalResults:
 *           type: number
 *           example: 15
 *         searchTerm:
 *           type: string
 *           example: "juan"
 *     InventoryOverview:
 *       type: object
 *       properties:
 *         totalProducts:
 *           type: number
 *           example: 150
 *         totalValue:
 *           type: number
 *           example: 125000.50
 *         lowStockProducts:
 *           type: array
 *           items:
 *             type: object
 *         categories:
 *           type: object
 *           example: {"Fútbol": 25, "Tenis": 20, "Running": 30}
 *         topCategories:
 *           type: array
 *           items:
 *             type: object
 *             properties:
 *               category:
 *                 type: string
 *                 example: "Fútbol"
 *               count:
 *                 type: number
 *                 example: 25
 *               value:
 *                 type: number
 *                 example: 25000.00
 *     CustomerAnalytics:
 *       type: object
 *       properties:
 *         totalCustomers:
 *           type: number
 *           example: 500
 *         activeCustomers:
 *           type: number
 *           example: 480
 *         documentTypeDistribution:
 *           type: object
 *           example: {"cedula": 450, "pasaporte": 30, "nit": 20}
 *         recentCustomers:
 *           type: array
 *           items:
 *             type: object
 *         customerGrowth:
 *           type: array
 *           items:
 *             type: object
 *             properties:
 *               date:
 *                 type: string
 *                 format: date
 *                 example: "2024-01-15"
 *               count:
 *                 type: number
 *                 example: 3
 *     SystemHealth:
 *       type: object
 *       properties:
 *         status:
 *           type: string
 *           enum: [healthy, warning, error]
 *           example: "healthy"
 *         timestamp:
 *           type: string
 *           format: date-time
 *         statistics:
 *           type: object
 *           properties:
 *             totalEntities:
 *               type: number
 *               example: 675
 *             activeEntities:
 *               type: number
 *               example: 648
 *             warnings:
 *               type: number
 *               example: 2
 *             errors:
 *               type: number
 *               example: 0
 *         alerts:
 *           type: object
 *           properties:
 *             lowStock:
 *               type: boolean
 *               example: true
 *             inactiveUsers:
 *               type: boolean
 *               example: false
 *             businessRuleViolations:
 *               type: boolean
 *               example: false
 */

/**
 * @swagger
 * /analytics/dashboard:
 *   get:
 *     summary: Get dashboard statistics
 *     tags: [Analytics]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Dashboard statistics retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   $ref: '#/components/schemas/DashboardStatistics'
 *                 message:
 *                   type: string
 *                   example: Dashboard statistics retrieved successfully
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Internal server error
 */
router.get('/dashboard',
  authMiddleware.verifyToken,
  authMiddleware.requireAdmin,
  analyticsController.getDashboardStatistics
);

/**
 * @swagger
 * /analytics/search:
 *   get:
 *     summary: Perform global search across all entities
 *     tags: [Analytics]
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
 *       - in: query
 *         name: limit
 *         schema:
 *           type: number
 *           minimum: 1
 *           maximum: 50
 *           default: 10
 *         description: Maximum number of results per entity
 *     responses:
 *       200:
 *         description: Global search completed successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   $ref: '#/components/schemas/GlobalSearchResponse'
 *                 message:
 *                   type: string
 *                   example: Global search completed successfully
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
  ValidationMiddleware.validateSearchTerm,
  analyticsController.globalSearch
);

/**
 * @swagger
 * /analytics/inventory:
 *   get:
 *     summary: Get inventory overview
 *     tags: [Analytics]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Inventory overview retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   $ref: '#/components/schemas/InventoryOverview'
 *                 message:
 *                   type: string
 *                   example: Inventory overview retrieved successfully
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Internal server error
 */
router.get('/inventory',
  authMiddleware.verifyToken,
  authMiddleware.requireAdminOrVendedor,
  analyticsController.getInventoryOverview
);

/**
 * @swagger
 * /analytics/customers:
 *   get:
 *     summary: Get customer analytics
 *     tags: [Analytics]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Customer analytics retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   $ref: '#/components/schemas/CustomerAnalytics'
 *                 message:
 *                   type: string
 *                   example: Customer analytics retrieved successfully
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Internal server error
 */
router.get('/customers',
  authMiddleware.verifyToken,
  authMiddleware.requireAdminOrVendedor,
  analyticsController.getCustomerAnalytics
);

/**
 * @swagger
 * /analytics/health:
 *   get:
 *     summary: Get system health status
 *     tags: [Analytics]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: System health status retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   $ref: '#/components/schemas/SystemHealth'
 *                 message:
 *                   type: string
 *                   example: System health status retrieved successfully
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Internal server error
 */
router.get('/health',
  authMiddleware.verifyToken,
  authMiddleware.requireAdmin,
  analyticsController.getSystemHealth
);

/**
 * @swagger
 * /analytics/relationships:
 *   get:
 *     summary: Get entity relationships information
 *     tags: [Analytics]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Entity relationships retrieved successfully
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Internal server error
 */
router.get('/relationships',
  authMiddleware.verifyToken,
  authMiddleware.requireAdmin,
  analyticsController.getEntityRelationships
);

/**
 * @swagger
 * /analytics/validate:
 *   get:
 *     summary: Validate business rules
 *     tags: [Analytics]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Business rules validation completed
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Internal server error
 */
router.get('/validate',
  authMiddleware.verifyToken,
  authMiddleware.requireAdmin,
  analyticsController.validateBusinessRules
);

export default router;
