import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import authRoutes from './routes/auth';
import chatRoutes from './routes/chat';
import contentRoutes from './routes/content';
import dashboardRoutes from './routes/dashboard';
import linkRouter from './routes/links';
import { checkSession } from './controllers/authController';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 10000;

// Multer setup
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadPath = path.join(__dirname, '../uploads');
    if (!fs.existsSync(uploadPath)) fs.mkdirSync(uploadPath, { recursive: true });
    cb(null, uploadPath);
  },
  filename: (req, file, cb) => cb(null, `${Date.now()}-${file.originalname}`),
});
const upload = multer({ storage });

// Middleware
app.use(cors({ origin: process.env.FRONTEND_URL || 'http://localhost:5173' }));
app.use(express.json());
app.use('/api/uploads', express.static(path.join(__dirname, '../uploads')));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/chat', chatRoutes);
app.use('/api/content', upload.array('files'), contentRoutes); // Multer here
app.use('/api/dashboard', checkSession, dashboardRoutes);
app.use('/api/links', linkRouter); // Already good

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});