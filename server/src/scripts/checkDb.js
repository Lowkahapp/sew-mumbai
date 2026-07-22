import dotenv from 'dotenv';
import mongoose from 'mongoose';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.resolve(__dirname, '../../.env') });

const uri = process.env.MONGODB_URI;
if (!uri) {
  console.log('NO_URI');
  process.exit(1);
}

await mongoose.connect(uri);
const db = mongoose.connection.db;
const cols = await db.listCollections().toArray();
const names = cols.map((c) => c.name).sort();
const counts = {};
for (const n of names) {
  counts[n] = await db.collection(n).countDocuments();
}

console.log(
  JSON.stringify(
    {
      host: mongoose.connection.host,
      db: db.databaseName,
      counts,
    },
    null,
    2
  )
);

await mongoose.disconnect();
