import express from 'express';
import { login, checkSession } from '../controllers/authController';

const router = express.Router();

// POST request for "yas" login
router.post('/login', login);

// GET request to check session
router.get('/session', checkSession, (req: express.Request, res: express.Response) => {
  console.log('Session check passed, user:', (req as any).user);
  res.json({ success: true, user: (req as any).user });
});

// Debug route
router.get('/', (req, res) => {
  res.json({ message: 'Auth API is working!' });
});

export default router;