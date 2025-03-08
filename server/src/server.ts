// src/server.ts
import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import authRoutes from './routes/auth';
import chatRoutes from './routes/chat';
import contentRoutes from './routes/content';
import dashboardRoutes from './routes/dashboard';
import linkRouter from './routes/links';
import { checkSession } from './controllers/authController';
import path from 'path';
import fs from 'fs';

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 10000;

// Configure CORS
app.use(cors({ origin: process.env.FRONTEND_URL || 'http://localhost:3000' }));

// Middleware
app.use(express.json());

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/chat', chatRoutes);
app.use('/api/content', checkSession, contentRoutes);
app.use('/api/dashboard', checkSession, dashboardRoutes);
app.use('/api/links', linkRouter);

app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Start server
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});