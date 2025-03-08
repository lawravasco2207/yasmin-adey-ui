// src/controllers/authController.ts
import { Request, Response, RequestHandler, NextFunction } from 'express';
import bcrypt from 'bcrypt';
import pool from '../db';
import { v4 as uuidv4 } from 'uuid';

export const login: RequestHandler = async (req: Request, res: Response): Promise<void> => {
  const { username, password } = req.body;
  if (!username || !password) {
    res.status(400).json({ success: false, message: 'Username and password required' });
    return;
  }

  try {
    const result = await pool.query('SELECT * FROM users WHERE username = $1', [username]);
    const user = result.rows[0];

    if (!user) {
      res.status(401).json({ success: false, message: 'Invalid credentials' });
      return;
    }

    const match = await bcrypt.compare(password, user.password);
    if (!match) {
      res.status(401).json({ success: false, message: 'Invalid credentials' });
      return;
    }

    const sessionResult = await pool.query(
      'INSERT INTO sessions (user_id) VALUES ($1) RETURNING session_id',
      [user.id]
    );
    const sessionId = sessionResult.rows[0].session_id;

    res.json({ success: true, sessionId });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

export const checkSession: RequestHandler = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  const sessionId = req.headers['x-session-id'] as string;
  if (!sessionId) {
    console.log('No session ID provided');
    res.status(401).json({ success: false, message: 'Please log in' });
    return;
  }
  try {
    const result = await pool.query(
      'SELECT * FROM sessions WHERE session_id = $1 AND expires_at > NOW()',
      [sessionId]
    );
    const session = result.rows[0];
    if (!session) {
      console.log('Invalid or expired session:', sessionId);
      res.status(401).json({ success: false, message: 'Session invalid or expired' });
      return;
    }
    console.log('Session verified for user:', session.user_id);
    (req as any).user = { id: session.user_id };
    next();
  } catch (error) {
    console.error('Session check error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};