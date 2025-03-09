// src/controllers/authController.ts
import { Request, Response, RequestHandler, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';

dotenv.config();

const SECRET_KEY = process.env.SECRET_KEY || 'your_secret_key';

export const login: RequestHandler = async (req: Request, res: Response): Promise<void> => {
  const { input } = req.body;

  console.log('Login attempt:', { input });

  if (!input) {
    console.log('No input provided');
    res.status(400).json({ success: false, message: 'Input required' });
    return;
  }

  if (input.toLowerCase() !== 'yas') {
    console.log('Invalid input—not "yas"');
    res.status(401).json({ success: false, message: 'Nope, try again!' });
    return;
  }

  console.log('Input matches "yas"—generating token');
  const token = jwt.sign({ user: 'yasmin' }, SECRET_KEY, { expiresIn: '1h' });

  res.json({ success: true, token });
};

export const checkSession: RequestHandler = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  const authHeader = req.headers['authorization'];

  console.log('Checking session, auth header:', authHeader || 'None provided');

  if (!authHeader) {
    console.log('No authorization header');
    res.status(401).json({ success: false, message: 'Please log in' });
    return;
  }

  const token = authHeader.split(' ')[1];
  if (!token) {
    console.log('No token found');
    res.status(401).json({ success: false, message: 'Please log in' });
    return;
  }

  try {
    console.log('Verifying token');
    const decoded = jwt.verify(token, SECRET_KEY) as { user: string };
    console.log('Token verified, user:', decoded.user);

    (req as any).user = { id: decoded.user };
    next();
  } catch (error: any) {
    console.error('Session check error:', {
      message: error.message,
      stack: error.stack,
    });
    res.status(401).json({ success: false, message: 'Session invalid or expired' });
  }
};