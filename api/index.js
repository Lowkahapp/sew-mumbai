/**
 * Vercel serverless entry — export Express app directly (required by Vercel).
 * Rewrites in vercel.json send all /api/* here.
 */
import createServer from '../server/src/server.js';

const app = createServer({ vercel: true });

export default app;
