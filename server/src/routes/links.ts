import express from 'express';
import { Request, Response } from 'express';
import pool from '../db'; // Adjust path to your DB setup
import { checkSession } from '../controllers/authController';

const router = express.Router();

// GET all links
router.get('/', checkSession, async (req: Request, res: Response) => {
  try {
    const result = await pool.query('SELECT * FROM links ORDER BY created_at DESC');
    res.json({ success: true, data: result.rows });
  } catch (error: any) {
    console.error('Get links error:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch links' });
  }
});

// POST new link
router.post('/add', checkSession, async (req: Request, res: Response) => {
  const { name, url } = req.body;
  if (!name || !url) {
    // return res.status(400).json({ success: false, message: 'Name and URL required' });
  }
  try {
    const result = await pool.query(
      'INSERT INTO links (name, url, created_at) VALUES ($1, $2, NOW()) RETURNING *',
      [name, url]
    );
    res.json({ success: true, data: result.rows[0] });
  } catch (error: any) {
    console.error('Add link error:', error);
    res.status(500).json({ success: false, message: 'Failed to add link' });
  }
});

// DELETE link
router.delete('/:id', checkSession, async (req: Request, res: Response): Promise<void> => {
  const { id } = req.params;
  try {
    const result = await pool.query('DELETE FROM links WHERE id = $1 RETURNING *', [id]);
    if (result.rowCount === 0) {
      res.status(404).json({ success: false, message: 'Link not found' });
    } else {
      res.json({ success: true, message: 'Link deleted' });
    }
  } catch (error: any) {
    console.error('Delete link error:', error);
    res.status(500).json({ success: false, message: 'Failed to delete link' });
  }
});

export default router;