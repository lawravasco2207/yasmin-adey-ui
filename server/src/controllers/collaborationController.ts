// src/controllers/collaborationController.ts
import { Request, Response, RequestHandler } from 'express';
import multer from 'multer';
import { Message, SharedFile } from '../models';

let messages: Message[] = [
  { id: 1, sender: 'You', text: 'Hey, budget approved!', timestamp: new Date().toISOString() },
];
let sharedFiles: SharedFile[] = [];

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, 'src/uploads/'),
  filename: (req, file, cb) => cb(null, `${Date.now()}-${Math.round(Math.random() * 1e9)}-${file.originalname}`),
});
const upload = multer({ storage });

export const getMessages: RequestHandler = (req: Request, res: Response) => {
  try {
    res.json({ success: true, data: messages });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

export const sendMessage: RequestHandler = (req: Request, res: Response) => {
  const { text, sender } = req.body;
  if (!text) {
    res.status(400).json({ success: false, message: 'Message text is required' });
    return;
  }
  try {
    const message: Message = {
      id: messages.length + 1,
      sender: sender || 'You',
      text,
      timestamp: new Date().toISOString(),
    };
    messages.push(message);
    res.json({ success: true, data: message });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to send message' });
  }
  return;
};

export const getFiles: RequestHandler = (req: Request, res: Response) => {
  try {
    res.json({ success: true, data: sharedFiles });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

const shareFileHandler: RequestHandler = (req: Request, res: Response): void => {
  if (!req.file) {
    res.status(400).json({ success: false, message: 'No file uploaded' });
    return;
  }
  try {
    const sharedFile: SharedFile = {
      id: sharedFiles.length + 1,
      name: req.file.originalname,
      url: `/uploads/${req.file.filename}`,
    };
    sharedFiles.push(sharedFile);
    res.json({ success: true, data: sharedFile });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to share file' });
  }
};

export const shareFile = [upload.single('file'), shareFileHandler];