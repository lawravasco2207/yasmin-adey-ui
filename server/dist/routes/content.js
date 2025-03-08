"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
// src/routes/content.ts
const express_1 = __importDefault(require("express"));
const contentController_1 = require("../controllers/contentController");
const router = express_1.default.Router();
router.post('/upload', contentController_1.contentUpload);
router.get('/', contentController_1.getContent);
router.get('/public', contentController_1.getPublicContent);
router.delete('/:id', contentController_1.deleteContent);
exports.default = router;
//# sourceMappingURL=content.js.map