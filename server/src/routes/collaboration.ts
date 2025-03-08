// src/routes/collaboration.ts
import express from 'express';
import { getMessages, sendMessage, getFiles, shareFile } from '../controllers/collaborationController';

const router = express.Router();

router.get('/messages', getMessages);
router.post('/messages', sendMessage);
router.get('/files', getFiles);
router.post('/files', ...shareFile);

export default router;