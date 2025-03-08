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
exports.contentUpload = exports.deleteContent = exports.getPublicContent = exports.getContent = exports.uploadContent = void 0;
const multer_1 = __importDefault(require("multer"));
const db_1 = __importDefault(require("../db"));
const storage = multer_1.default.diskStorage({
    destination: (req, file, cb) => cb(null, 'src/uploads/'),
    filename: (req, file, cb) => cb(null, `${Date.now()}-${Math.round(Math.random() * 1e9)}-${file.originalname}`),
});
const upload = (0, multer_1.default)({ storage });
// src/controllers/contentController.ts (partial)
// src/controllers/contentController.ts (partial)
const uploadContent = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const files = req.files;
    const { caption, brand_links } = req.body; // brand_links as JSON string
    console.log('Received upload:', { files: files === null || files === void 0 ? void 0 : files.map(f => f.filename), caption, brand_links });
    if (!files || files.length === 0) {
        res.status(400).json({ success: false, message: 'No files uploaded' });
        return;
    }
    try {
        const filePaths = files.map(file => `/uploads/${file.filename}`);
        const type = files.length > 1 ? 'slideshow' : files[0].mimetype.split('/')[0];
        const parsedBrandLinks = brand_links ? JSON.parse(brand_links) : null; // Parse JSON string
        const result = yield db_1.default.query('INSERT INTO content (title, type, status, file_path, caption, brand_links) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *', [files[0].originalname, type, 'published', JSON.stringify(filePaths), caption || null, parsedBrandLinks]);
        console.log('Content uploaded:', result.rows[0]);
        res.json({ success: true, data: result.rows[0] });
    }
    catch (error) {
        console.error('Upload error:', error);
        res.status(500).json({ success: false, message: 'Failed to upload' });
    }
});
exports.uploadContent = uploadContent;
// Ensure getContent and getPublicContent return brand_links (they already do with SELECT *)
const getContent = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const result = yield db_1.default.query('SELECT * FROM content ORDER BY id DESC');
        console.log('Fetched content:', result.rows);
        res.json({ success: true, data: result.rows });
    }
    catch (error) {
        console.error('Get content error:', error);
        res.status(500).json({ success: false, message: 'Failed to fetch content' });
    }
});
exports.getContent = getContent;
const getPublicContent = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const result = yield db_1.default.query("SELECT * FROM content WHERE status = 'published' ORDER BY id DESC");
        console.log('Fetched public content:', result.rows);
        res.json({ success: true, data: result.rows });
    }
    catch (error) {
        console.error('Get public content error:', error);
        res.status(500).json({ success: false, message: 'Failed to fetch public content' });
    }
});
exports.getPublicContent = getPublicContent;
const deleteContent = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const id = parseInt(req.params.id, 10);
    if (isNaN(id)) {
        res.status(400).json({ success: false, message: 'Invalid content ID' });
        return;
    }
    try {
        const result = yield db_1.default.query('DELETE FROM content WHERE id = $1 RETURNING *', [id]);
        if (result.rowCount === 0) {
            res.status(404).json({ success: false, message: 'Content not found' });
            return;
        }
        console.log('Content deleted:', result.rows[0]);
        res.json({ success: true, message: 'Content deleted' });
    }
    catch (error) {
        console.error('Delete content error:', error);
        res.status(500).json({ success: false, message: 'Failed to delete content' });
    }
});
exports.deleteContent = deleteContent;
exports.contentUpload = [upload.array('files', 10), exports.uploadContent]; // Up to 10 files for slideshows
//# sourceMappingURL=contentController.js.map