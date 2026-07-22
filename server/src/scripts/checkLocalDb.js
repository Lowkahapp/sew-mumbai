import mongoose from 'mongoose';

await mongoose.connect('mongodb://127.0.0.1:27017/sew-mumbai');
const db = mongoose.connection.db;
const cols = await db.listCollections().toArray();
const counts = {};
for (const c of cols) {
  counts[c.name] = await db.collection(c.name).countDocuments();
}
console.log(JSON.stringify({ source: 'local', db: db.databaseName, counts }, null, 2));
await mongoose.disconnect();
