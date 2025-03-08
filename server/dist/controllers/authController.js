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
exports.checkSession = exports.login = void 0;
const bcrypt_1 = __importDefault(require("bcrypt"));
const db_1 = __importDefault(require("../db"));
const login = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { username, password } = req.body;
    if (!username || !password) {
        res.status(400).json({ success: false, message: 'Username and password required' });
        return;
    }
    try {
        const result = yield db_1.default.query('SELECT * FROM users WHERE username = $1', [username]);
        const user = result.rows[0];
        if (!user) {
            res.status(401).json({ success: false, message: 'Invalid credentials' });
            return;
        }
        const match = yield bcrypt_1.default.compare(password, user.password);
        if (!match) {
            res.status(401).json({ success: false, message: 'Invalid credentials' });
            return;
        }
        const sessionResult = yield db_1.default.query('INSERT INTO sessions (user_id) VALUES ($1) RETURNING session_id', [user.id]);
        const sessionId = sessionResult.rows[0].session_id;
        res.json({ success: true, sessionId });
    }
    catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
});
exports.login = login;
const checkSession = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const sessionId = req.headers['x-session-id'];
    if (!sessionId) {
        console.log('No session ID provided');
        res.status(401).json({ success: false, message: 'Please log in' });
        return;
    }
    try {
        const result = yield db_1.default.query('SELECT * FROM sessions WHERE session_id = $1 AND expires_at > NOW()', [sessionId]);
        const session = result.rows[0];
        if (!session) {
            console.log('Invalid or expired session:', sessionId);
            res.status(401).json({ success: false, message: 'Session invalid or expired' });
            return;
        }
        console.log('Session verified for user:', session.user_id);
        req.user = { id: session.user_id };
        next();
    }
    catch (error) {
        console.error('Session check error:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
});
exports.checkSession = checkSession;
//# sourceMappingURL=authController.js.map