import { Request, Response, RequestHandler } from 'express';
import pool from '../db'; // Adjust path
import { checkSession } from './authController';
import path from 'path';
import fs from 'fs/promises';

export const contentUpload: RequestHandler = async (req: Request, res: Response): Promise<void> => {
  try {
    console.log('Upload request files:', req.files);
    if (!req.files || !Array.isArray(req.files)) {
      res.status(400).json({ success: false, message: 'No files uploaded' });
      return;
    }
    const files = req.files as Express.Multer.File[];
    const { caption, brand_links, status } = req.body;
    const filePaths = files.map(file => `${file.filename}`); // Just filename, no /uploads/

    const validStatus = status === 'published' ? 'published' : 'draft';

    const result = await pool.query(
      'INSERT INTO content (title, type, status, file_path, caption, brand_links) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *',
      [
        files[0].originalname,
        files.length > 1 ? 'slideshow' : files[0].mimetype.startsWith('video') ? 'video' : 'image',
        validStatus,
        JSON.stringify(filePaths),
        caption || null,
        brand_links ? JSON.stringify(JSON.parse(brand_links)) : null,
      ]
    );

    res.status(201).json({ success: true, data: result.rows[0] });
  } catch (error) {
    if (error instanceof Error) {
      console.error('Content upload error:', error.message, error.stack);
    } else {
      console.error('Content upload error:', error);
    }
    res.status(500).json({ success: false, message: 'Failed to upload content' });
  }
};

export const getContent: RequestHandler = async (req: Request, res: Response) => {
  try {
    const result = await pool.query('SELECT * FROM content');
    const content = result.rows.map(row => ({
      ...row,
      file_path: typeof row.file_path === 'string' && !row.file_path.startsWith('[')
        ? JSON.stringify([row.file_path]) // Wrap string in array
        : row.file_path, // Already JSON array
    }));
    res.json({ success: true, data: content });
  } catch (error: any) {
    console.error('Get content error:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch content' });
  }
};

export const getPublicContent: RequestHandler = async (req: Request, res: Response) => {
  try {
    const result = await pool.query("SELECT * FROM content WHERE status = 'published'");
    const content = result.rows.map(row => ({
      ...row,
      file_path: typeof row.file_path === 'string' && !row.file_path.startsWith('[')
        ? JSON.stringify([row.file_path])
        : row.file_path,
    }));
    res.json({ success: true, data: content });
  } catch (error: any) {
    console.error('Get public content error:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch public content' });
  }
};

export const deleteContent: RequestHandler = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const result = await pool.query('DELETE FROM content WHERE id = $1 RETURNING *', [id]);
    if (result.rowCount === 0) {
      // return res.status(404).json({ success: false, message: 'Content not found' });
    }

    const filePaths = typeof result.rows[0].file_path === 'string' && result.rows[0].file_path.startsWith('[')
      ? JSON.parse(result.rows[0].file_path)
      : [result.rows[0].file_path];

    await Promise.all(
      filePaths.map(async (filePath: string) => {
        const fileName = filePath.split('/uploads/')[1]; // Extract filename
        const fullPath = path.join(__dirname, '../uploads', fileName); // Match server.ts
        try {
          await fs.access(fullPath); // Check if file exists
          await fs.unlink(fullPath);
          console.log(`Deleted file: ${fullPath}`);
        } catch (fileError: any) {
          console.warn(`Couldn’t delete file: ${fullPath} - ${fileError.message}`);
          // Keep going—don’t crash
        }
      })
    );

    // return res.json({ success: true, message: 'Content deleted' });
  } catch (error: any) {
    console.error('Delete content error:', error.message, error.stack); // Better logging
    // return res.status(500).json({ success: false, message: 'Failed to delete content' });
  }
};

// Export with checkSession where needed
export default {
  contentUpload: [checkSession, contentUpload],
  getContent: [checkSession, getContent],
  getPublicContent,
  deleteContent: [checkSession, deleteContent],
};