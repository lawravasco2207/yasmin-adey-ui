"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const contentController_1 = __importDefault(require("../controllers/contentController"));
const router = express_1.default.Router();
router.post('/upload', contentController_1.default.contentUpload); // Array with checkSession
router.get('/', contentController_1.default.getContent); // Array with checkSession
router.get('/public', contentController_1.default.getPublicContent); // No auth
router.delete('/:id', contentController_1.default.deleteContent); // Array with checkSession
exports.default = router;
//# sourceMappingURL=content.js.map