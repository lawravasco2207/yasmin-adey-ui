"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
// src/routes/collaboration.ts
const express_1 = __importDefault(require("express"));
const collaborationController_1 = require("../controllers/collaborationController");
const router = express_1.default.Router();
router.get('/messages', collaborationController_1.getMessages);
router.post('/messages', collaborationController_1.sendMessage);
router.get('/files', collaborationController_1.getFiles);
router.post('/files', ...collaborationController_1.shareFile);
exports.default = router;
//# sourceMappingURL=collaboration.js.map