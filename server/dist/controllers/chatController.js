"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.chatMessageUpload = exports.submitReply = exports.getMessages = exports.submitMessage = void 0;
const multer_1 = __importDefault(require("multer"));
const db_1 = __importDefault(require("../db"));
const crypto = __importStar(require("crypto"));
const storage = multer_1.default.diskStorage({
    destination: (req, file, cb) => cb(null, 'src/uploads/'),
    filename: (req, file, cb) => cb(null, `${Date.now()}-${Math.round(Math.random() * 1e9)}-${file.originalname}`),
});
const upload = (0, multer_1.default)({ storage });
// 32-byte key (256 bits) - 64 hex chars = 32 bytes
const SERVER_KEY = Buffer.from('0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef', 'hex');
// OR use a 32-char raw string: Buffer.from('my-super-secret-chat-key-32bytes!!') - 32 bytes in UTF-8
const IV_LENGTH = 16;
const submitMessage = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
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
        const result = yield db_1.default.query('INSERT INTO chat_messages (sender_name, sender_email, vision, website_url, image_path, message) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *', [sender_name, sender_email, vision || null, website_url || null, imagePath, encryptedMessage]);
        console.log('Chat message saved:', result.rows[0]);
        res.json({ success: true, message: 'Message sent successfully', data: result.rows[0] });
    }
    catch (error) {
        console.error('Chat submission error:', {
            message: error.message,
            stack: error.stack,
        });
        res.status(500).json({ success: false, message: 'Failed to send message', error: error.message });
    }
});
exports.submitMessage = submitMessage;
const getMessages = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const result = yield db_1.default.query('SELECT * FROM chat_messages ORDER BY created_at DESC');
        const decryptedMessages = result.rows.map((msg) => {
            try {
                if (msg.message.includes(':')) {
                    const [ivHex, encrypted] = msg.message.split(':');
                    console.log('Decrypting message:', { ivHex, encrypted });
                    const iv = Buffer.from(ivHex, 'hex');
                    if (iv.length !== IV_LENGTH) {
                        console.warn('Invalid IV length for message:', msg.id);
                        return Object.assign(Object.assign({}, msg), { message: '[Encrypted - Invalid IV]' });
                    }
                    const decipher = crypto.createDecipheriv('aes-256-cbc', SERVER_KEY, iv);
                    let decrypted = decipher.update(encrypted, 'hex', 'utf8');
                    decrypted += decipher.final('utf8');
                    return Object.assign(Object.assign({}, msg), { message: decrypted });
                }
                console.log('Message not encrypted, returning as-is:', msg.message);
                return msg;
            }
            catch (error) {
                console.error('Decryption failed for message:', msg.id, error);
                return Object.assign(Object.assign({}, msg), { message: '[Encrypted - Decryption Failed]' });
            }
        });
        console.log('Fetched and processed chat messages:', decryptedMessages);
        res.json({ success: true, data: decryptedMessages });
    }
    catch (error) {
        console.error('Get messages error:', error);
        res.status(500).json({ success: false, message: 'Failed to fetch messages' });
    }
});
exports.getMessages = getMessages;
const submitReply = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const userId = req.user.id;
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
        const result = yield db_1.default.query('INSERT INTO chat_replies (message_id, user_id, reply) VALUES ($1, $2, $3) RETURNING *', [message_id, userId, encryptedReplyMessage]);
        console.log('Reply saved:', result.rows[0]);
        res.json({ success: true, message: 'Reply sent successfully', data: result.rows[0] });
    }
    catch (error) {
        console.error('Reply submission error:', error);
        res.status(500).json({ success: false, message: 'Failed to send reply' });
    }
});
exports.submitReply = submitReply;
exports.chatMessageUpload = [upload.single('image'), exports.submitMessage];
//# sourceMappingURL=chatController.js.map