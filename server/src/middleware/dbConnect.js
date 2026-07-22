import mongoose from 'mongoose';
import connectDB from '../config/db.js';

let dbReady = null;

/**
 * Connect to MongoDB before API routes that need the database (Vercel serverless).
 */
export const dbConnectMiddleware = async (req, res, next) => {
  const path = req.path || req.url?.split('?')[0] || '';
  if (path === '/api/health' || path === '/api/localities') {
    return next();
  }

  try {
    if (!process.env.MONGODB_URI) {
      throw new Error('MONGODB_URI is not set');
    }
    if (mongoose.connection.readyState === 1) {
      return next();
    }
    if (!dbReady) {
      dbReady = connectDB().catch((err) => {
        dbReady = null;
        throw err;
      });
    }
    await dbReady;
    next();
  } catch (err) {
    console.error('DB middleware error:', err);
    res.status(500).json({ message: err.message || 'Database connection failed' });
  }
};

export default dbConnectMiddleware;
