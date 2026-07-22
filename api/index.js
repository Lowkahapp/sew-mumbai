import connectDB from '../server/src/config/db.js';
import createServer from '../server/src/server.js';

/**
 * Vercel serverless entry — wraps the Express app.
 * All /api/* requests are rewritten here.
 */
const app = createServer();

let dbReady = null;
const ensureDb = () => {
  if (!dbReady) {
    dbReady = connectDB().catch((err) => {
      dbReady = null;
      throw err;
    });
  }
  return dbReady;
};

export default async function handler(req, res) {
  await ensureDb();
  return app(req, res);
}
