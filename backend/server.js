import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import mongoose from 'mongoose';
import cookieParser from 'cookie-parser';

import authRoutes from './routes/auth.js';
import userRoutes from './routes/user.js';
import parkingRoutes from './routes/parking.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// --- CHANGE 1: CORS Settings ---
// Ab ye tumhare Vercel link aur localhost dono se request accept karega
app.use(cors({
  origin: [
    'http://localhost:5173', 
    'https://parking-solution-qkff-7gncslaae-ayushkumar74s-projects.vercel.app' // <-- Yahan apna Vercel wala link dalo
  ],
  credentials: true
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// --- CHANGE 2: MongoDB Connection ---
// Humne yahan error handling thodi improve kar di hai
const dbURI = process.env.MONGODB_URI || 'mongodb://localhost:27017/parkeasy';

mongoose.connect(dbURI)
.then(() => console.log('✅ MongoDB Cloud se connect ho gaya!'))
.catch(err => console.error('❌ MongoDB Connection Error:', err));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/user', userRoutes);
app.use('/api/parking', parkingRoutes);

app.get('/', (req, res) => {
  res.json({ message: 'ParkEasy API is Live!' });
});

app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});