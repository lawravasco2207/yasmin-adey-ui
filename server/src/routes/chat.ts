import express, { Request, Response } from 'express';
import pool from '../db'; // Adjust path
import { checkSession } from '../controllers/authController';
import { chatMessageUpload, submitReply } from '../controllers/chatController';

const router = express.Router();

router.get('/messages', checkSession, async (req: Request, res: Response) => {
  try {
    console.log('Fetching messages for user:', (req as any).user);
    const result = await pool.query('SELECT * FROM chat_messages'); // Adjust table name
    res.json({ success: true, data: result.rows });
  } catch (error: any) {
    console.error('Get messages error:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch messages' });
  }
});

router.post('/submit', chatMessageUpload);

router.post('/reply', checkSession, submitReply);

export default router;


// src/routes/chat.ts

