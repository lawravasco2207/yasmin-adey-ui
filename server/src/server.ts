import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv'; // Ensure dotenv is used
import authRoutes from './routes/auth';
import chatRoutes from './routes/chat';
import contentRoutes from './routes/content';
import dashboardRoutes from './routes/dashboard';
import { checkSession } from './controllers/authController';
import linkRouter from './routes/links';


// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 10000; // Default to 10000 if PORT is not defined

// Configure CORS to allow frontend access
app.use(cors({ origin: process.env.FRONTEND_URL }));

// Middleware
app.use(express.json());
app.use('/uploads', express.static('src/uploads'));

// Routes
app.use('/api/links', linkRouter);
app.use('/api/auth', authRoutes);
app.use('/api/chat', chatRoutes);
app.use('/api/content', checkSession, contentRoutes);
app.use('/api/dashboard', checkSession, dashboardRoutes);

// Start server
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
