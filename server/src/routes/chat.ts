// src/routes/chat.ts
import express from 'express';
import { chatMessageUpload, getMessages, submitReply } from '../controllers/chatController';
import { checkSession } from '../controllers/authController';

const router = express.Router();

// Public endpoint for submitting messages (no login required)
router.post('/submit', chatMessageUpload);

// Protected endpoints (require valid sessionId for Yasmin or developer)
router.get('/messages', checkSession, getMessages);
router.post('/reply', checkSession, submitReply);

export default router;