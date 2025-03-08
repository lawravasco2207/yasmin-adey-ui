"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
// src/routes/chat.ts
const express_1 = __importDefault(require("express"));
const chatController_1 = require("../controllers/chatController");
const authController_1 = require("../controllers/authController");
const router = express_1.default.Router();
// Public endpoint for submitting messages (no login required)
router.post('/submit', chatController_1.chatMessageUpload);
// Protected endpoints (require valid sessionId for Yasmin or developer)
router.get('/messages', authController_1.checkSession, chatController_1.getMessages);
router.post('/reply', authController_1.checkSession, chatController_1.submitReply);
exports.default = router;
//# sourceMappingURL=chat.js.map