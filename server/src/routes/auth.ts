import express from 'express';
import { login, checkSession } from '../controllers/authController';

const router = express.Router();

// POST request for "yas" login
router.post('/login', login);

// GET request to check session
router.get('/session', checkSession);

// Debug route
router.get('/', (req, res) => {
  res.json({ message: 'Auth API is working!' });
});

export default router;