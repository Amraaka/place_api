import dotenv from 'dotenv';
dotenv.config({ path: new URL('./.env', import.meta.url) });

import express from 'express';
import cors from 'cors';
import morgan from 'morgan';
import cookieParser from 'cookie-parser';

import connectDB from './db/connect.js';
import usersRoutes from './routes/users.routes.js';
import placesRoutes from './routes/places.routes.js';

const app = express();
const PORT = process.env.PORT || 5000;

if (!process.env.JWT_SECRET) {
  throw new Error('JWT_SECRET is required in environment variables.');
}


app.use(cors({
  origin: process.env.CLIENT_ORIGIN || 'http://localhost:5173',
  credentials: true
}));

app.use(morgan('dev'));
app.use(express.json());
app.use(cookieParser());

(async () => {
  try {
    await connectDB();

    app.get('/', (req, res) => {
      res.json({ message: 'API is live • MongoDB connected' });
    });

    app.use('/api/users', usersRoutes);
    app.use('/api/places', placesRoutes);

    app.use((req, res) => {
      res.status(404).json({ message: 'Route not found.' });
    });

    app.use((error, req, res, next) => {
      console.error(error);
      res.status(500).json({
        message: error?.message || 'Internal server error.',
      });
    });

    app.listen(PORT, () => {
      console.log(`Server running on http://localhost:${PORT}`);
    });
  } catch (err) {
    console.error('Failed to start server:', err);
    process.exit(1);
  }
})();