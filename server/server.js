// app.js  or  server.js
import dotenv from 'dotenv';
dotenv.config();

import express from 'express';
import connectDB from './db/connect.js';

const app = express();
const PORT = process.env.PORT || 5000;

app.use(express.json());

// Connect DB before starting server
(async () => {
  try {
    await connectDB();

    // ── Your routes here ──
    app.get('/', (req, res) => {
      res.json({ message: 'API is live • MongoDB connected' });
    });

    app.listen(PORT, () => {
      console.log(`Server running on http://localhost:${PORT}`);
    });
  } catch (err) {
    console.error('Failed to start server:', err);
    process.exit(1);
  }
})();