import express, { Application } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import rateLimit from 'express-rate-limit';
import swaggerUi from 'swagger-ui-express';
import swaggerJsdoc from 'swagger-jsdoc';
import { config } from './config/env';
import { errorHandler, notFoundHandler } from './middleware/error.middleware';
import { swaggerBasicAuth } from './middleware/swaggerAuth.middleware';

// Import routes
import authRoutes from './modules/auth/auth.routes';
import propertyRoutes from './modules/properties/property.routes';
import unitRoutes from './modules/units/unit.routes';
import tenantRoutes from './modules/tenants/tenant.routes';
import ledgerRoutes from './modules/ledger/ledger.routes';
import valuationRoutes from './modules/valuation/valuation.routes';

const app: Application = express();

// Security middleware
app.use(helmet());
app.use(cors());

// Rate limiting
const limiter = rateLimit({
  windowMs: config.rateLimit.windowMs,
  max: config.rateLimit.maxRequests,
  message: 'Too many requests from this IP, please try again later.',
  standardHeaders: true,
  legacyHeaders: false,
});
app.use('/api/', limiter);

// Body parsing middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Logging middleware
if (!config.isTest) {
  app.use(morgan(config.isDevelopment ? 'dev' : 'combined'));
}

// Swagger documentation
const swaggerOptions: swaggerJsdoc.Options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Vestly API - Property Ownership Ledger',
      version: '1.0.0',
      description:
        'A multi-tenant property management system with ownership credit tracking',
      contact: {
        name: 'API Support',
        email: 'support@vestly.com',
      },
    },
    servers: [
      {
        url: `${config.baseUrl}`,
        description: `${config.nodeEnv} server`,
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
  apis: [
    './src/modules/**/*.controller.ts',
    './src/modules/**/*.routes.ts',
    './dist/modules/**/*.controller.js',
    './dist/modules/**/*.routes.js',
  ],
};

const swaggerSpec = swaggerJsdoc(swaggerOptions);

app.use('/api-docs', swaggerBasicAuth, swaggerUi.serve, swaggerUi.setup(swaggerSpec));

// Health check endpoint
app.get('/health', (_req, res) => {
  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    environment: config.nodeEnv,
  });
});

// API routes
const apiRouter = express.Router();

apiRouter.use('/auth', authRoutes);
apiRouter.use('/', propertyRoutes);
apiRouter.use('/', unitRoutes);
apiRouter.use('/', tenantRoutes);
apiRouter.use('/', ledgerRoutes);
apiRouter.use('/', valuationRoutes);

app.use(`/api/${config.api.version}`, apiRouter);

// Error handling
app.use(notFoundHandler);
app.use(errorHandler);

export default app;
