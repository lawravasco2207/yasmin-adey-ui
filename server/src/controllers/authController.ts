// src/controllers/authController.ts
import { Request, Response, RequestHandler, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import pool from '../db';
import dotenv from 'dotenv';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { WavFileInfo } from 'wav-file-info'; // For basic audio parsing

dotenv.config();

const SECRET_KEY = process.env.SECRET_KEY || 'your_secret_key';

// Multer for audio upload
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadPath = path.join(__dirname, '../uploads');
    if (!fs.existsSync(uploadPath)) fs.mkdirSync(uploadPath, { recursive: true });
    cb(null, uploadPath);
  },
  filename: (req, file, cb) => cb(null, `${Date.now()}-${file.originalname}`),
});
const upload = multer({ storage });

export const login: RequestHandler = async (req: Request, res: Response): Promise<void> => {
  const { username } = req.body;
  const voiceFile = req.file; // Expect 'voice' field from FormData

  console.log('Voice login request received:', { username, hasVoice: !!voiceFile });

  if (!username || !voiceFile) {
    console.log('Missing username or voice recording');
    res.status(400).json({ success: false, message: 'Username and voice recording required' });
    return;
  }

  try {
    // Query user
    console.log('Querying users table for:', username);
    const result = await pool.query('SELECT * FROM users WHERE username = $1', [username]);
    const user = result.rows[0];

    if (!user) {
      console.log('No user found for:', username);
      res.status(401).json({ success: false, message: 'User not found' });
      return;
    }

    // Extract voice features (simplified—average amplitude for demo)
    const voiceData = await extractVoiceFeatures(voiceFile.path);
    console.log('Extracted voice features:', voiceData.slice(0, 5), '...');

    // Compare with stored voiceprint
    if (!user.voice_print) {
      console.log('No voice print stored—saving new one');
      await pool.query('UPDATE users SET voice_print = $1 WHERE id = $2', [
        JSON.stringify(voiceData),
        user.id,
      ]);
      console.log('Saved new voice print for:', username);
    } else {
      const storedVoicePrint = JSON.parse(user.voice_print);
      const distance = compareVoicePrints(storedVoicePrint, voiceData);
      console.log('Voice match distance:', distance);

      if (distance > 0.5) { // Threshold—adjust later
        console.log('Voice mismatch for:', username);
        res.status(401).json({ success: false, message: 'Voice not recognized' });
        return;
      }
    }

    console.log('Generating JWT for user:', user.id);
    const token = jwt.sign({ userId: user.id }, SECRET_KEY, { expiresIn: '1h' });
    console.log('Voice login successful');

    // Clean up temp file
    fs.unlinkSync(voiceFile.path);

    res.json({ success: true, token });
  } catch (error: any) {
    console.error('Voice login error:', {
      message: error.message,
      stack: error.stack,
    });
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};

// Simple voice feature extraction (demo—replace with real MFCC later)
async function extractVoiceFeatures(filePath: string): Promise<number[]> {
  const info = await WavFileInfo(filePath);
  const buffer = fs.readFileSync(filePath);
  const samples = new Int16Array(buffer.buffer, 44, info.fmt.data_length / 2); // Skip WAV header
  const avgAmplitude = Array.from(samples).reduce((sum, val) => sum + Math.abs(val), 0) / samples.length;
  return [avgAmplitude]; // Placeholder—real voiceprint would use MFCCs
}

// Simple comparison (demo—Euclidean distance)
function compareVoicePrints(stored: number[], submitted: number[]): number {
  if (stored.length !== submitted.length) throw new Error('Voice print lengths mismatch');
  let sum = 0;
  for (let i = 0; i < stored.length; i++) {
    const diff = stored[i] - submitted[i];
    sum += diff * diff;
  }
  return Math.sqrt(sum);
}

export const voiceLoginUpload = [upload.single('voice'), login];

export const checkSession: RequestHandler = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  const authHeader = req.headers['authorization'];

  console.log('Checking session, auth header:', authHeader || 'None provided');

  if (!authHeader) {
    console.log('No authorization header provided');
    res.status(401).json({ success: false, message: 'Please log in' });
    return;
  }

  const token = authHeader.split(' ')[1];
  if (!token) {
    console.log('No token found in header:', authHeader);
    res.status(401).json({ success: false, message: 'Please log in' });
    return;
  }

  try {
    console.log('Verifying JWT token');
    const decoded = jwt.verify(token, SECRET_KEY) as { userId: number };
    console.log('Token verified, userId:', decoded.userId);

    (req as any).user = { id: decoded.userId };
    next();
  } catch (error: any) {
    console.error('Session check error:', {
      message: error.message,
      stack: error.stack,
    });
    res.status(401).json({ success: false, message: 'Session invalid or expired', error: error.message });
  }
};