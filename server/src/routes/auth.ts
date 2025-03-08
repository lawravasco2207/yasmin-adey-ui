import express from 'express';
import { login, checkSession } from '../controllers/authController';

const router = express.Router();

// ✅ POST request for login
router.post('/login', login);

// ✅ GET request to check session (important for auth checks)
router.get('/session', checkSession);

// ✅ Add a default route for debugging
router.get('/', (req, res) => {
  res.json({ message: 'Auth API is working!' });
});

export default router;
