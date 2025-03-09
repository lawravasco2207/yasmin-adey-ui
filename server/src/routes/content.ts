import express from 'express';
import contentController from '../controllers/contentController';

const router = express.Router();

router.post('/upload', contentController.contentUpload); // Array with checkSession
router.get('/', contentController.getContent); // Array with checkSession
router.get('/public', contentController.getPublicContent); // No auth
router.delete('/:id', contentController.deleteContent); // Array with checkSession

export default router;