import express from 'express';
import { voiceLoginUpload, checkSession } from '../controllers/authController';

const router = express.Router();

// ✅ POST request for voice login (uses multer middleware from authController)
router.post('/login', voiceLoginUpload);

// ✅ GET request to check session (important for auth checks)
router.get('/session', checkSession);

// ✅ Add a default route for debugging
router.get('/', (req, res) => {
  res.json({ message: 'Auth API is working!' });
});

export default router;