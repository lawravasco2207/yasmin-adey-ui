// src/controllers/chatController.ts
import { Request, Response, RequestHandler } from 'express';
import multer from 'multer';
import pool from '../db';
import * as crypto from 'crypto';
import path from 'path';

// Multer setup for image uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadPath = path.join(__dirname, '../uploads'); // Adjusted for src/ structure
    cb(null, uploadPath);
  },
  filename: (req, file, cb) => cb(null, `${Date.now()}-${Math.round(Math.random() * 1e9)}-${file.originalname}`),
});
const upload = multer({ storage });

// Encryption setup
const SERVER_KEY = Buffer.from('0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef', 'hex'); // 32 bytes
const IV_LENGTH = 16;

// Submit a new chat message
export const submitMessage: RequestHandler = async (req: Request, res: Response): Promise<void> => {
  const { sender_name, sender_email, vision, website_url, message } = req.body;
  const imageFile = req.file;

  console.log('Received chat submission:', {
    sender_name,
    sender_email,
    vision,
    website_url,
    message,
    image: imageFile ? imageFile.filename : 'No image',
  });

  if (!sender_name || !sender_email || !message) {
    console.log('Missing required fields:', { sender_name, sender_email, message });
    res.status(400).json({ success: false, message: 'Name, email, and message are required' });
    return;
  }

  try {
    // Verify key length
    if (SERVER_KEY.length !== 32) {
      throw new Error(`Invalid SERVER_KEY length: ${SERVER_KEY.length} bytes, expected 32`);
    }

    const iv = crypto.randomBytes(IV_LENGTH);
    console.log('Generated IV:', iv.toString('hex'));
    const cipher = crypto.createCipheriv('aes-256-cbc', SERVER_KEY, iv);
    let encrypted = cipher.update(message, 'utf8', 'hex');
    encrypted += cipher.final('hex');
    const encryptedMessage = `${iv.toString('hex')}:${encrypted}`;
    console.log('Encrypted message:', encryptedMessage);

    const imagePath = imageFile ? `/uploads/${imageFile.filename}` : null;
    console.log('Preparing to save:', { sender_name, sender_email, vision, website_url, imagePath, encryptedMessage });

    const result = await pool.query(
      'INSERT INTO chat_messages (sender_name, sender_email, vision, website_url, image_path, message) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *',
      [sender_name, sender_email, vision || null, website_url || null, imagePath, encryptedMessage]
    );
    console.log('Chat message saved:', result.rows[0]);
    res.json({ success: true, message: 'Message sent successfully', data: result.rows[0] });
  } catch (error: any) {
    console.error('Chat submission error:', {
      message: error.message,
      stack: error.stack,
    });
    res.status(500).json({ success: false, message: 'Failed to send message', error: error.message });
  }
};

// Get all chat messages with decryption
export const getMessages: RequestHandler = async (req: Request, res: Response): Promise<void> => {
  try {
    const result = await pool.query('SELECT * FROM chat_messages ORDER BY created_at DESC');
    const decryptedMessages = result.rows.map((msg) => {
      try {
        if (msg.message && msg.message.includes(':')) {
          const [ivHex, encrypted] = msg.message.split(':');
          console.log('Decrypting message:', { ivHex, encrypted });
          const iv = Buffer.from(ivHex, 'hex');
          if (iv.length !== IV_LENGTH) {
            console.warn('Invalid IV length for message:', msg.id);
            return { ...msg, message: '[Encrypted - Invalid IV]' };
          }
          const decipher = crypto.createDecipheriv('aes-256-cbc', SERVER_KEY, iv);
          let decrypted = decipher.update(encrypted, 'hex', 'utf8');
          decrypted += decipher.final('utf8');
          return { ...msg, message: decrypted };
        }
        console.log('Message not encrypted, returning as-is:', msg.message);
        return msg;
      } catch (error: any) {
        console.error('Decryption failed for message:', msg.id, error.message);
        return { ...msg, message: '[Encrypted - Decryption Failed]' };
      }
    });
    console.log('Fetched and processed chat messages:', decryptedMessages.length);
    res.json({ success: true, data: decryptedMessages });
  } catch (error: any) {
    console.error('Get messages error:', error.message);
    res.status(500).json({ success: false, message: 'Failed to fetch messages', error: error.message });
  }
};

// Submit a reply to a chat message
export const submitReply: RequestHandler = async (req: Request, res: Response): Promise<void> => {
  const userId = (req as any).user?.id; // From checkSession middleware
  const { message_id, reply } = req.body;

  if (!message_id || !reply) {
    console.log('Missing required fields:', { message_id, reply });
    res.status(400).json({ success: false, message: 'Message ID and reply are required' });
    return;
  }

  if (!userId) {
    console.log('No user ID from session');
    res.status(401).json({ success: false, message: 'Unauthorized' });
    return;
  }

  try {
    const iv = crypto.randomBytes(IV_LENGTH);
    const cipher = crypto.createCipheriv('aes-256-cbc', SERVER_KEY, iv);
    let encryptedReply = cipher.update(reply, 'utf8', 'hex');
    encryptedReply += cipher.final('hex');
    const encryptedReplyMessage = `${iv.toString('hex')}:${encryptedReply}`;

    // Update chat_messages with reply instead of separate table
    const result = await pool.query(
      'UPDATE chat_messages SET reply = $1, replied_at = NOW() WHERE id = $2 AND reply IS NULL RETURNING *',
      [encryptedReplyMessage, message_id]
    );

    if (result.rowCount === 0) {
      console.log('No message found or already replied:', message_id);
      res.status(400).json({ success: false, message: 'Message not found or already replied' });
      return;
    }

    console.log('Reply saved:', result.rows[0]);
    res.json({ success: true, message: 'Reply sent successfully', data: result.rows[0] });
  } catch (error: any) {
    console.error('Reply submission error:', error.message);
    res.status(500).json({ success: false, message: 'Failed to send reply', error: error.message });
  }
};

// Middleware for multer upload + submitMessage
export const chatMessageUpload = [upload.single('image'), submitMessage];