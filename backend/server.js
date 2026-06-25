import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import connectDB from './config/db.js';
import authRoutes from './routes/authRoutes.js';
import sectionRoutes from './routes/sectionRoutes.js';
import messageRoutes from './routes/messageRoutes.js';

dotenv.config();
connectDB();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

app.use(cors({
  origin: process.env.NODE_ENV === 'production'
    ? 'https://bridgeit.onrender.com'
    : ['http://localhost:3000', 'http://localhost:5173'],
  credentials: true
}));

app.use(express.json({ limit: '100mb' }));
app.use(express.urlencoded({ limit: '100mb', extended: true }));

app.use('/api/auth', authRoutes);
app.use('/api/sections', sectionRoutes);
app.use('/api/messages', messageRoutes);

// Serve React frontend in production
if (process.env.NODE_ENV === 'production') {
  app.use(express.static(path.join(__dirname, '../frontend/build')));

  app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, '../frontend/build', 'index.html'));
  });
} else {
  app.get('/', (req, res) => res.send('BridgeIt API running ✓'));
}

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));