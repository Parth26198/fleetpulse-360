import dotenv from 'dotenv';
import crypto from 'crypto';

dotenv.config();

const isProduction = process.env.NODE_ENV === 'production';

// Cryptographically secure JWT secret resolution
const resolveJwtSecret = (): string => {
  if (process.env.JWT_SECRET && process.env.JWT_SECRET.trim().length >= 32) {
    return process.env.JWT_SECRET.trim();
  }

  if (isProduction) {
    console.warn('⚠️ [SECURITY WARNING] No valid JWT_SECRET provided in production environment!');
    console.warn('⚠️ Automatically generating an in-memory 256-bit cryptographic random secret.');
    return crypto.randomBytes(32).toString('hex');
  }

  return 'fleetpulse360-dev-local-jwt-token-secret-key-2026';
};

export const ENV = {
  PORT: process.env.PORT ? parseInt(process.env.PORT, 10) : 5000,
  NODE_ENV: process.env.NODE_ENV || 'development',
  DATABASE_URL: process.env.DATABASE_URL || 'file:./dev.db',
  JWT_SECRET: resolveJwtSecret(),
  JWT_EXPIRES_IN: process.env.JWT_EXPIRES_IN || '7d',
  FRONTEND_URL: process.env.FRONTEND_URL || 'http://localhost:5173',
};
