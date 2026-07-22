import mongoose from 'mongoose';

let connecting = null;

/**
 * Connect to MongoDB (safe for serverless — reuses the open connection).
 */
const connectDB = async () => {
  const uri = process.env.MONGODB_URI;
  if (!uri) {
    throw new Error('MONGODB_URI is not set');
  }

  if (mongoose.connection.readyState === 1) {
    return mongoose.connection;
  }

  if (!connecting) {
    connecting = mongoose
      .connect(uri, {
        bufferCommands: false,
      })
      .then((conn) => {
        if (process.env.VERCEL !== '1') {
          console.log(`MongoDB connected: ${conn.connection.host}`);
        }
        return conn;
      })
      .catch((err) => {
        connecting = null;
        throw err;
      });
  }

  return connecting;
};

export default connectDB;
