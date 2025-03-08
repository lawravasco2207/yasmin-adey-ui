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
exports.deleteLink = exports.getLinks = exports.addLink = void 0;
const db_1 = __importDefault(require("../db"));
const addLink = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { name, url } = req.body;
    if (!name || !url) {
        res.status(400).json({ success: false, message: 'Name and URL are required' });
        return;
    }
    try {
        const result = yield db_1.default.query('INSERT INTO links (name, url) VALUES ($1, $2) RETURNING *', [name, url]);
        console.log('Link added:', result.rows[0]);
        res.json({ success: true, data: result.rows[0] });
    }
    catch (error) {
        console.error('Add link error:', error);
        res.status(500).json({ success: false, message: 'Failed to add link' });
    }
});
exports.addLink = addLink;
const getLinks = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const result = yield db_1.default.query('SELECT * FROM links ORDER BY created_at DESC');
        console.log('Fetched links:', result.rows);
        res.json({ success: true, data: result.rows });
    }
    catch (error) {
        console.error('Get links error:', error);
        res.status(500).json({ success: false, message: 'Failed to fetch links' });
    }
});
exports.getLinks = getLinks;
const deleteLink = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const id = parseInt(req.params.id, 10);
    if (isNaN(id)) {
        res.status(400).json({ success: false, message: 'Invalid link ID' });
        return;
    }
    try {
        const result = yield db_1.default.query('DELETE FROM links WHERE id = $1 RETURNING *', [id]);
        if (result.rowCount === 0) {
            res.status(404).json({ success: false, message: 'Link not found' });
            return;
        }
        console.log('Link deleted:', result.rows[0]);
        res.json({ success: true, message: 'Link deleted' });
    }
    catch (error) {
        console.error('Delete link error:', error);
        res.status(500).json({ success: false, message: 'Failed to delete link' });
    }
});
exports.deleteLink = deleteLink;
//# sourceMappingURL=linkController.js.map