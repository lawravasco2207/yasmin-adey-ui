"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.shareFile = exports.getFiles = exports.sendMessage = exports.getMessages = void 0;
const multer_1 = __importDefault(require("multer"));
let messages = [
    { id: 1, sender: 'You', text: 'Hey, budget approved!', timestamp: new Date().toISOString() },
];
let sharedFiles = [];
const storage = multer_1.default.diskStorage({
    destination: (req, file, cb) => cb(null, 'src/uploads/'),
    filename: (req, file, cb) => cb(null, `${Date.now()}-${Math.round(Math.random() * 1e9)}-${file.originalname}`),
});
const upload = (0, multer_1.default)({ storage });
const getMessages = (req, res) => {
    try {
        res.json({ success: true, data: messages });
    }
    catch (error) {
        res.status(500).json({ success: false, message: 'Server error' });
    }
};
exports.getMessages = getMessages;
const sendMessage = (req, res) => {
    const { text, sender } = req.body;
    if (!text) {
        res.status(400).json({ success: false, message: 'Message text is required' });
        return;
    }
    try {
        const message = {
            id: messages.length + 1,
            sender: sender || 'You',
            text,
            timestamp: new Date().toISOString(),
        };
        messages.push(message);
        res.json({ success: true, data: message });
    }
    catch (error) {
        res.status(500).json({ success: false, message: 'Failed to send message' });
    }
    return;
};
exports.sendMessage = sendMessage;
const getFiles = (req, res) => {
    try {
        res.json({ success: true, data: sharedFiles });
    }
    catch (error) {
        res.status(500).json({ success: false, message: 'Server error' });
    }
};
exports.getFiles = getFiles;
const shareFileHandler = (req, res) => {
    if (!req.file) {
        res.status(400).json({ success: false, message: 'No file uploaded' });
        return;
    }
    try {
        const sharedFile = {
            id: sharedFiles.length + 1,
            name: req.file.originalname,
            url: `/uploads/${req.file.filename}`,
        };
        sharedFiles.push(sharedFile);
        res.json({ success: true, data: sharedFile });
    }
    catch (error) {
        res.status(500).json({ success: false, message: 'Failed to share file' });
    }
};
exports.shareFile = [upload.single('file'), shareFileHandler];
//# sourceMappingURL=collaborationController.js.map