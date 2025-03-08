// src/routes/content.ts
import express from 'express';
import { contentUpload, getContent, getPublicContent, deleteContent } from '../controllers/contentController';

const router = express.Router();

router.post('/upload', contentUpload);
router.get('/', getContent);
router.get('/public', getPublicContent);
router.delete('/:id', deleteContent);

export default router;