// src/controllers/dashboardController.ts
import { Request, Response, RequestHandler } from 'express';
import pool from '../db'; // Adjust path
import { checkSession } from './authController'; // Import checkSession

export const getTodos: RequestHandler = async (req: Request, res: Response) => {
  try {
    console.log('Fetching todos for user:', (req as any).user);
    // No user_id filter—single-user "yas" mode
    const result = await pool.query('SELECT * FROM todos');
    res.json({ success: true, data: result.rows });
  } catch (error: any) {
    console.error('Get todos error:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch todos' });
  }
};

export const addTodo: RequestHandler = async (req: Request, res: Response) => {
  const { title, priority, due_date } = req.body;

  if (!title || !priority || !due_date) {
    console.log('Missing todo fields:', { title, priority, due_date });
    res.status(400).json({ success: false, message: 'Title, priority, and due date required' });
    return;
  }

  try {
    console.log('Adding todo for user:', (req as any).user);
    const result = await pool.query(
      'INSERT INTO todos (title, priority, due_date) VALUES ($1, $2, $3) RETURNING *',
      [title, priority, due_date]
    );
    res.json({ success: true, data: result.rows[0] });
  } catch (error: any) {
    console.error('Add todo error:', error);
    res.status(500).json({ success: false, message: 'Failed to add todo' });
  }
};

// Export with checkSession middleware
export default {
  getTodos: [checkSession, getTodos],
  addTodo: [checkSession, addTodo],
};