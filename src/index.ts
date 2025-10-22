import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import dotenv from 'dotenv';
import swaggerUi from 'swagger-ui-express';
import swaggerJsdoc from 'swagger-jsdoc';

// Import routes
import authRoutes from './routes/auth';
import tokenRoutes from './routes/token';
import usuariosRoutes from './routes/usuarios';
import productosRoutes from './routes/productos';
import clientesRoutes from './routes/clientes';
import pedidosRoutes from './routes/pedidos';
import pedidosEncryptionRoutes from './routes/pedidos-encryption';
import encryptionRoutes from './routes/encryption';

// Import middlewares
import { ErrorMiddleware } from './middlewares/ErrorMiddleware';

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// Swagger configuration
const swaggerOptions = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'SportsLine API',
      version: '1.0.0',
      description: 'API para gestión de productos, clientes y pedidos',
    },
    servers: [
      {
        url: `http://localhost:${PORT}`,
        description: 'Development server',
      },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
        },
      },
    },
  },
  apis: ['./src/routes/*.ts', './src/controllers/*.ts'],
};

const swaggerSpec = swaggerJsdoc(swaggerOptions);

// Middleware
app.use(helmet());
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Swagger documentation
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/token', tokenRoutes);
app.use('/api/usuarios', usuariosRoutes);
app.use('/api/productos', productosRoutes);
app.use('/api/clientes', clientesRoutes);
app.use('/api/pedidos', pedidosRoutes);
app.use('/api/pedidos-encryption', pedidosEncryptionRoutes);
app.use('/api/encryption', encryptionRoutes);

// Basic route
app.get('/', (req, res) => {
  res.json({
    message: 'SportsLine API',
    version: '1.0.0',
    status: 'running',
    documentation: '/api-docs'
  });
});

// Health check
app.get('/health', (req, res) => {
  res.json({
    status: 'OK',
    timestamp: new Date().toISOString()
  });
});

// Error handling middleware
app.use(ErrorMiddleware.handle);

// Start server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

export default app;
