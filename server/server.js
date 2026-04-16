import dotenv from 'dotenv';
dotenv.config({ path: new URL('./.env', import.meta.url) });

import express from 'express';
import cors from 'cors';
import session from 'express-session';
import MongoStore from 'connect-mongo';

import connectDB from './db/connect.js';
import usersRoutes from './routes/users.routes.js';
import placesRoutes from './routes/places.routes.js';

const app = express();
const PORT = process.env.PORT || 5000;

if (!process.env.SESSION_SECRET) {
  throw new Error('SESSION_SECRET is required');
}

app.use(cors({
  origin: process.env.CLIENT_ORIGIN || 'http://localhost:5173',
  credentials: true
}));

app.use(express.json());

(async () => {
  try {
    await connectDB();

    app.use(
      session({
        secret: process.env.SESSION_SECRET,
        resave: false,
        saveUninitialized: false,
        store: MongoStore.create({ mongoUrl: process.env.MONGODB_URI }),
        cookie: {
          httpOnly: true,
          sameSite: 'lax',
          secure: process.env.NODE_ENV === 'production',
          maxAge: 24 * 60 * 60 * 1000,
        },
      }),
    );

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
