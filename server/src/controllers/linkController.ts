// src/controllers/linkController.ts
import { Request, Response, RequestHandler } from 'express';
import pool from '../db';

export const addLink: RequestHandler = async (req: Request, res: Response): Promise<void> => {
  const { name, url } = req.body;
  if (!name || !url) {
    res.status(400).json({ success: false, message: 'Name and URL are required' });
    return;
  }
  try {
    const result = await pool.query(
      'INSERT INTO links (name, url) VALUES ($1, $2) RETURNING *',
      [name, url]
    );
    console.log('Link added:', result.rows[0]);
    res.json({ success: true, data: result.rows[0] });
  } catch (error) {
    console.error('Add link error:', error);
    res.status(500).json({ success: false, message: 'Failed to add link' });
  }
};

export const getLinks: RequestHandler = async (req: Request, res: Response): Promise<void> => {
  try {
    const result = await pool.query('SELECT * FROM links ORDER BY created_at DESC');
    console.log('Fetched links:', result.rows);
    res.json({ success: true, data: result.rows });
  } catch (error) {
    console.error('Get links error:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch links' });
  }
};

export const deleteLink: RequestHandler = async (req: Request, res: Response): Promise<void> => {
  const id = parseInt(req.params.id, 10);
  if (isNaN(id)) {
    res.status(400).json({ success: false, message: 'Invalid link ID' });
    return;
  }
  try {
    const result = await pool.query('DELETE FROM links WHERE id = $1 RETURNING *', [id]);
    if (result.rowCount === 0) {
      res.status(404).json({ success: false, message: 'Link not found' });
      return;
    }
    console.log('Link deleted:', result.rows[0]);
    res.json({ success: true, message: 'Link deleted' });
  } catch (error) {
    console.error('Delete link error:', error);
    res.status(500).json({ success: false, message: 'Failed to delete link' });
  }
};