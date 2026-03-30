import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config({ path: new URL('../.env', import.meta.url) });

const MONGODB_URI = process.env.MONGODB_URI;
if (!MONGODB_URI) throw new Error('MONGODB_URI not found');

const cached = (globalThis.mongoose ??= { conn: null, promise: null });

const options = {
  bufferCommands: false,
  serverSelectionTimeoutMS: 5000,
};

async function connectDB() {
  if (cached.conn) return cached.conn;

  cached.promise ??= mongoose
    .connect(MONGODB_URI, options)
    .then((m) => {
      console.log('MongoDB connected');
      return m;
    })
    .catch((err) => {
      cached.promise = null;
      throw err;
    });

  cached.conn = await cached.promise;
  return cached.conn;
}

export default connectDB;