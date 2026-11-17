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
app.use(cors({
  origin: '*',
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

// Bootstrap
const PORT = ENV.PORT;
const server = app.listen(PORT, () => {
  console.log(`🚀 FLEETPULSE 360 Backend running on http://localhost:${PORT}`);
  console.log(`📡 Health Check: http://localhost:${PORT}/api/health`);
});

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
