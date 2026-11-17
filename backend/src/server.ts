import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import { ENV } from './config/env';
import { apiRouter } from './routes/apiRoutes';
import { errorHandler } from './middlewares/errorHandler';
import { prisma } from './lib/prisma';

const app = express();

// Security headers
app.use(helmet({
  crossOriginResourcePolicy: false,
}));

// Cross-origin resource sharing
const isProd = ENV.NODE_ENV === 'production';
const allowedFrontendUrl = (ENV.FRONTEND_URL || '').trim().replace(/\/+$/, '');

app.use(cors({
  origin: (origin, callback) => {
    // Allow non-browser requests (e.g. server-to-server health checks, curl, mobile clients)
    if (!origin) return callback(null, true);

    // Allow all in development or when explicitly enabled
    if (!isProd || process.env.CORS_ORIGIN === '*') {
      return callback(null, true);
    }

    try {
      const parsed = new URL(origin);
      // Allow configured FRONTEND_URL or any Vercel deployment preview (*.vercel.app)
      if (
        origin === allowedFrontendUrl ||
        parsed.hostname.endsWith('.vercel.app') ||
        parsed.hostname === 'localhost' ||
        parsed.hostname === '127.0.0.1'
      ) {
        return callback(null, true);
      }
    } catch {
      // Invalid URL format
    }

    return callback(new Error(`CORS policy: Access denied from origin ${origin}`));
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
}));

// Body parsers
app.use(express.json({ limit: '20mb' }));
app.use(express.urlencoded({ extended: true, limit: '20mb' }));

// Rate limiting (generous for dashboard operations)
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 2000,
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, message: 'Too many requests. Please try again later.' },
});
app.use('/api', limiter);

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ONLINE',
    service: 'FLEETPULSE 360 Enterprise API',
    version: '1.0.0',
    timestamp: new Date().toISOString(),
  });
});

// Mount application API routes
app.use('/api', apiRouter);

// Global Error Handler
app.use(errorHandler);

// Bootstrap (Listen when not in test mode)
const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : ENV.PORT;
let server: any;

if (process.env.NODE_ENV !== 'test') {
  server = app.listen(PORT, () => {
    console.log(`🚀 FLEETPULSE 360 Backend running on http://localhost:${PORT}`);
    console.log(`📡 Health Check: http://localhost:${PORT}/api/health`);
  });
}

// Graceful shutdown
process.on('SIGINT', async () => {
  console.log('Shutting down server...');
  await prisma.$disconnect();
  server.close(() => {
    console.log('Server stopped.');
    process.exit(0);
  });
});

process.on('SIGTERM', async () => {
  await prisma.$disconnect();
  server.close(() => process.exit(0));
});

export default app;
