// src/controllers/dashboardController.ts
import { Request, Response, RequestHandler } from 'express';
import pool from '../db';

export const getTodos: RequestHandler = async (req: Request, res: Response): Promise<void> => {
  const userId = (req as any).user.id; // From authenticateToken
  try {
    const result = await pool.query('SELECT * FROM todos WHERE user_id = $1 ORDER BY due_date', [userId]);
    res.json({ success: true, data: result.rows });
  } catch (error) {
    console.error('Get todos error:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch todos' });
  }
};

export const addTodo: RequestHandler = async (req: Request, res: Response): Promise<void> => {
  const userId = (req as any).user.id;
  const { title, priority, due_date } = req.body;
  if (!title || !priority || !due_date) {
    res.status(400).json({ success: false, message: 'Title, priority, and due date are required' });
    return;
  }
  try {
    const result = await pool.query(
      'INSERT INTO todos (title, priority, due_date, user_id) VALUES ($1, $2, $3, $4) RETURNING *',
      [title, priority, due_date, userId]
    );
    console.log('Todo added:', result.rows[0]);
    res.json({ success: true, data: result.rows[0] });
  } catch (error) {
    console.error('Add todo error:', error);
    res.status(500).json({ success: false, message: 'Failed to add todo' });
  }
};