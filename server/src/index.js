import dotenv from 'dotenv';
import connectDB from './config/db.js';
import createServer from './server.js';

dotenv.config();

const PORT = process.env.PORT || 5000;
const app = createServer();

const start = async () => {
  await connectDB();
  app.listen(PORT, () => {
    console.log(`SewMumbai API running on http://localhost:${PORT}`);
  });
};

start().catch((err) => {
  console.error('Failed to start server', err);
  process.exit(1);
});
