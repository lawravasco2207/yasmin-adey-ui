// src/controllers/chatController.ts
import { Request, Response, RequestHandler } from 'express';
import multer from 'multer';
import pool from '../db';
import * as crypto from 'crypto';

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, 'src/uploads/'),
  filename: (req, file, cb) => cb(null, `${Date.now()}-${Math.round(Math.random() * 1e9)}-${file.originalname}`),
});
const upload = multer({ storage });

// 32-byte key (256 bits) - 64 hex chars = 32 bytes
const SERVER_KEY = Buffer.from('0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef', 'hex');
// OR use a 32-char raw string: Buffer.from('my-super-secret-chat-key-32bytes!!') - 32 bytes in UTF-8
const IV_LENGTH = 16;

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
    console.log('SERVER_KEY length:', SERVER_KEY.length);
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

export const getMessages: RequestHandler = async (req: Request, res: Response): Promise<void> => {
  try {
    const result = await pool.query('SELECT * FROM chat_messages ORDER BY created_at DESC');
    const decryptedMessages = result.rows.map((msg) => {
      try {
        if (msg.message.includes(':')) {
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
      } catch (error) {
        console.error('Decryption failed for message:', msg.id, error);
        return { ...msg, message: '[Encrypted - Decryption Failed]' };
      }
    });
    console.log('Fetched and processed chat messages:', decryptedMessages);
    res.json({ success: true, data: decryptedMessages });
  } catch (error) {
    console.error('Get messages error:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch messages' });
  }
};

export const submitReply: RequestHandler = async (req: Request, res: Response): Promise<void> => {
  const userId = (req as any).user.id;
  const { message_id, reply } = req.body;

  if (!message_id || !reply) {
    res.status(400).json({ success: false, message: 'Message ID and reply are required' });
    return;
  }

  try {
    const iv = crypto.randomBytes(IV_LENGTH);
    const cipher = crypto.createCipheriv('aes-256-cbc', SERVER_KEY, iv);
    let encryptedReply = cipher.update(reply, 'utf8', 'hex');
    encryptedReply += cipher.final('hex');
    const encryptedReplyMessage = `${iv.toString('hex')}:${encryptedReply}`;

    const result = await pool.query(
      'INSERT INTO chat_replies (message_id, user_id, reply) VALUES ($1, $2, $3) RETURNING *',
      [message_id, userId, encryptedReplyMessage]
    );
    console.log('Reply saved:', result.rows[0]);
    res.json({ success: true, message: 'Reply sent successfully', data: result.rows[0] });
  } catch (error) {
    console.error('Reply submission error:', error);
    res.status(500).json({ success: false, message: 'Failed to send reply' });
  }
};

export const chatMessageUpload = [upload.single('image'), submitMessage];