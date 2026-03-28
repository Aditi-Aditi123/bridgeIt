import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import connectDB from './config/db.js';
import authRoutes from './routes/authRoutes.js';

dotenv.config(); // must be first
connectDB();

const app = express();

app.use(cors({
  origin: ['http://localhost:3000', 'http://localhost:5173'],
  credentials: true
}));
app.use(express.json());

// Routes
app.use('/api/auth', authRoutes);

// Health check
app.get('/', (req, res) => res.send('BridgeIt API running ✓'));

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));