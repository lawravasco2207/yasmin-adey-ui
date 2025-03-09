"use strict";
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
const express_1 = __importDefault(require("express"));
const db_1 = __importDefault(require("../db")); // Adjust path
const authController_1 = require("../controllers/authController");
const chatController_1 = require("../controllers/chatController");
const router = express_1.default.Router();
router.get('/messages', authController_1.checkSession, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        console.log('Fetching messages for user:', req.user);
        const result = yield db_1.default.query('SELECT * FROM chat_messages'); // Adjust table name
        res.json({ success: true, data: result.rows });
    }
    catch (error) {
        console.error('Get messages error:', error);
        res.status(500).json({ success: false, message: 'Failed to fetch messages' });
    }
}));
router.post('/submit', chatController_1.chatMessageUpload);
router.post('/reply', authController_1.checkSession, chatController_1.submitReply);
exports.default = router;
// src/routes/chat.ts
//# sourceMappingURL=chat.js.map