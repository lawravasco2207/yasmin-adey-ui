// src/controllers/contentController.ts
import { Request, Response, RequestHandler } from 'express';
import multer from 'multer';
import pool from '../db';

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, 'src/uploads/'),
  filename: (req, file, cb) => cb(null, `${Date.now()}-${Math.round(Math.random() * 1e9)}-${file.originalname}`),
});
const upload = multer({ storage });

// src/controllers/contentController.ts (partial)
// src/controllers/contentController.ts (partial)
export const uploadContent: RequestHandler = async (req: Request, res: Response): Promise<void> => {
  const files = req.files as Express.Multer.File[] | undefined;
  const { caption, brand_links } = req.body; // brand_links as JSON string

  console.log('Received upload:', { files: files?.map(f => f.filename), caption, brand_links });

  if (!files || files.length === 0) {
    res.status(400).json({ success: false, message: 'No files uploaded' });
    return;
  }

  try {
    const filePaths = files.map(file => `/uploads/${file.filename}`);
    const type = files.length > 1 ? 'slideshow' : files[0].mimetype.split('/')[0];
    const parsedBrandLinks = brand_links ? JSON.parse(brand_links) : null; // Parse JSON string
    const result = await pool.query(
      'INSERT INTO content (title, type, status, file_path, caption, brand_links) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *',
      [files[0].originalname, type, 'published', JSON.stringify(filePaths), caption || null, parsedBrandLinks]
    );
    console.log('Content uploaded:', result.rows[0]);
    res.json({ success: true, data: result.rows[0] });
  } catch (error) {
    console.error('Upload error:', error);
    res.status(500).json({ success: false, message: 'Failed to upload' });
  }
};

// Ensure getContent and getPublicContent return brand_links (they already do with SELECT *)


export const getContent: RequestHandler = async (req: Request, res: Response): Promise<void> => {
  try {
    const result = await pool.query('SELECT * FROM content ORDER BY id DESC');
    console.log('Fetched content:', result.rows);
    res.json({ success: true, data: result.rows });
  } catch (error) {
    console.error('Get content error:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch content' });
  }
};

export const getPublicContent: RequestHandler = async (req: Request, res: Response): Promise<void> => {
  try {
    const result = await pool.query("SELECT * FROM content WHERE status = 'published' ORDER BY id DESC");
    console.log('Fetched public content:', result.rows);
    res.json({ success: true, data: result.rows });
  } catch (error) {
    console.error('Get public content error:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch public content' });
  }
};

export const deleteContent: RequestHandler = async (req: Request, res: Response): Promise<void> => {
  const id = parseInt(req.params.id, 10);
  if (isNaN(id)) {
    res.status(400).json({ success: false, message: 'Invalid content ID' });
    return;
  }
  try {
    const result = await pool.query('DELETE FROM content WHERE id = $1 RETURNING *', [id]);
    if (result.rowCount === 0) {
      res.status(404).json({ success: false, message: 'Content not found' });
      return;
    }
    console.log('Content deleted:', result.rows[0]);
    res.json({ success: true, message: 'Content deleted' });
  } catch (error) {
    console.error('Delete content error:', error);
    res.status(500).json({ success: false, message: 'Failed to delete content' });
  }
};

export const contentUpload = [upload.array('files', 10), uploadContent]; // Up to 10 files for slideshows