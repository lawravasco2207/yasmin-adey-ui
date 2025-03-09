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
exports.deleteContent = exports.getPublicContent = exports.getContent = exports.contentUpload = void 0;
const db_1 = __importDefault(require("../db")); // Adjust path
const authController_1 = require("./authController");
const path_1 = __importDefault(require("path"));
const promises_1 = __importDefault(require("fs/promises"));
const contentUpload = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        console.log('Upload request files:', req.files);
        if (!req.files || !Array.isArray(req.files)) {
            res.status(400).json({ success: false, message: 'No files uploaded' });
            return;
        }
        const files = req.files;
        const { caption, brand_links, status } = req.body;
        const filePaths = files.map(file => `${file.filename}`); // Just filename, no /uploads/
        const validStatus = status === 'published' ? 'published' : 'draft';
        const result = yield db_1.default.query('INSERT INTO content (title, type, status, file_path, caption, brand_links) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *', [
            files[0].originalname,
            files.length > 1 ? 'slideshow' : files[0].mimetype.startsWith('video') ? 'video' : 'image',
            validStatus,
            JSON.stringify(filePaths),
            caption || null,
            brand_links ? JSON.stringify(JSON.parse(brand_links)) : null,
        ]);
        res.status(201).json({ success: true, data: result.rows[0] });
    }
    catch (error) {
        if (error instanceof Error) {
            console.error('Content upload error:', error.message, error.stack);
        }
        else {
            console.error('Content upload error:', error);
        }
        res.status(500).json({ success: false, message: 'Failed to upload content' });
    }
});
exports.contentUpload = contentUpload;
const getContent = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const result = yield db_1.default.query('SELECT * FROM content');
        const content = result.rows.map(row => (Object.assign(Object.assign({}, row), { file_path: typeof row.file_path === 'string' && !row.file_path.startsWith('[')
                ? JSON.stringify([row.file_path]) // Wrap string in array
                : row.file_path })));
        res.json({ success: true, data: content });
    }
    catch (error) {
        console.error('Get content error:', error);
        res.status(500).json({ success: false, message: 'Failed to fetch content' });
    }
});
exports.getContent = getContent;
const getPublicContent = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const result = yield db_1.default.query("SELECT * FROM content WHERE status = 'published'");
        const content = result.rows.map(row => (Object.assign(Object.assign({}, row), { file_path: typeof row.file_path === 'string' && !row.file_path.startsWith('[')
                ? JSON.stringify([row.file_path])
                : row.file_path })));
        res.json({ success: true, data: content });
    }
    catch (error) {
        console.error('Get public content error:', error);
        res.status(500).json({ success: false, message: 'Failed to fetch public content' });
    }
});
exports.getPublicContent = getPublicContent;
const deleteContent = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { id } = req.params;
        const result = yield db_1.default.query('DELETE FROM content WHERE id = $1 RETURNING *', [id]);
        if (result.rowCount === 0) {
            // return res.status(404).json({ success: false, message: 'Content not found' });
        }
        const filePaths = typeof result.rows[0].file_path === 'string' && result.rows[0].file_path.startsWith('[')
            ? JSON.parse(result.rows[0].file_path)
            : [result.rows[0].file_path];
        yield Promise.all(filePaths.map((filePath) => __awaiter(void 0, void 0, void 0, function* () {
            const fileName = filePath.split('/uploads/')[1]; // Extract filename
            const fullPath = path_1.default.join(__dirname, '../uploads', fileName); // Match server.ts
            try {
                yield promises_1.default.access(fullPath); // Check if file exists
                yield promises_1.default.unlink(fullPath);
                console.log(`Deleted file: ${fullPath}`);
            }
            catch (fileError) {
                console.warn(`Couldn’t delete file: ${fullPath} - ${fileError.message}`);
                // Keep going—don’t crash
            }
        })));
        // return res.json({ success: true, message: 'Content deleted' });
    }
    catch (error) {
        console.error('Delete content error:', error.message, error.stack); // Better logging
        // return res.status(500).json({ success: false, message: 'Failed to delete content' });
    }
});
exports.deleteContent = deleteContent;
// Export with checkSession where needed
exports.default = {
    contentUpload: [authController_1.checkSession, exports.contentUpload],
    getContent: [authController_1.checkSession, exports.getContent],
    getPublicContent: exports.getPublicContent,
    deleteContent: [authController_1.checkSession, exports.deleteContent],
};
//# sourceMappingURL=contentController.js.map