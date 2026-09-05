import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import authRoutes from './routes/auth.js';
import boardRoutes from './routes/boards.js';
import formRoutes from './routes/forms.js';
import { loadDatabase } from './db.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Enable CORS for Vite frontend
app.use(
  cors({
    origin: ['http://localhost:5173', 'http://localhost:3000', 'https://ziroboard.netlify.app'],
    credentials: true,
  })
);

app.use(express.json({ limit: '20mb' }));

// Initialize DB on boot
loadDatabase();

// Healthcheck
app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', service: 'Ziro Backend API', timestamp: new Date().toISOString() });
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/boards', boardRoutes);
app.use('/api/forms', formRoutes);

app.listen(PORT, () => {
  console.log(`🚀 Ziro Backend Server running on http://localhost:${PORT}`);
  console.log(`🔒 Auth API: http://localhost:${PORT}/api/auth`);
  console.log(`📋 Boards API: http://localhost:${PORT}/api/boards`);
  console.log(`📝 Forms API: http://localhost:${PORT}/api/forms`);
});
