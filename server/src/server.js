import express from 'express';
import cors from 'cors';
import { LOCALITIES } from './constants/localities.js';
import dbConnectMiddleware from './middleware/dbConnect.js';
import authRoutes from './routes/authRoutes.js';
import userRoutes from './routes/userRoutes.js';
import tailorRoutes from './routes/tailorRoutes.js';
import serviceRoutes from './routes/serviceRoutes.js';
import bookingRoutes from './routes/bookingRoutes.js';
import reviewRoutes from './routes/reviewRoutes.js';
import adminRoutes from './routes/adminRoutes.js';
import measurementRoutes from './routes/measurementRoutes.js';

/**
 * Express app factory — registers all API routes.
 * Used by local index.js and Vercel api/index.js.
 */
const createServer = ({ vercel = false } = {}) => {
  const app = express();

  const allowedOrigins = [
    process.env.CLIENT_URL,
    'http://localhost:5173',
    'http://127.0.0.1:5173',
  ].filter(Boolean);

  app.use(
    cors({
      origin(origin, callback) {
        if (!origin) return callback(null, true);
        if (allowedOrigins.includes(origin)) return callback(null, true);
        if (/\.vercel\.app$/i.test(origin)) return callback(null, true);
        return callback(null, false);
      },
      credentials: true,
    })
  );
  app.use(express.json());

  if (vercel || process.env.VERCEL === '1') {
    app.use(dbConnectMiddleware);
  }

  app.get('/api/health', (_req, res) => {
    res.json({
      status: 'ok',
      app: 'SewMumbai',
      hasMongoUri: Boolean(process.env.MONGODB_URI),
      hasJwtSecret: Boolean(process.env.JWT_SECRET),
    });
  });

  app.get('/api/localities', (_req, res) => {
    res.json({ localities: LOCALITIES });
  });

  app.use('/api/auth', authRoutes);
  app.use('/api/users', userRoutes);
  app.use('/api/tailors', tailorRoutes);
  app.use('/api/services', serviceRoutes);
  app.use('/api/bookings', bookingRoutes);
  app.use('/api/reviews', reviewRoutes);
  app.use('/api/admin', adminRoutes);
  app.use('/api/measurements', measurementRoutes);

  app.use((err, _req, res, _next) => {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  });

  return app;
};

export default createServer;