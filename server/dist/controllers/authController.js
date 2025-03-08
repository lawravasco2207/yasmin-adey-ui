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
const db_1 = __importDefault(require("../db"));
const uuid_1 = require("uuid");
const login = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { username, password } = req.body;
    if (!username || !password) {
        res.status(400).json({ success: false, message: 'Username and password required' });
        return;
    }
    try {
        const result = yield db_1.default.query('SELECT * FROM users WHERE username = $1 AND password = $2', [username, password]);
        const user = result.rows[0];
        if (!user) {
            res.status(401).json({ success: false, message: 'Invalid credentials' });
            return;
        }
        const sessionId = (0, uuid_1.v4)();
        const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24-hour session
        yield db_1.default.query('INSERT INTO sessions (user_id, session_id, expires_at) VALUES ($1, $2, $3) RETURNING *', [user.id, sessionId, expiresAt]);
        console.log(`User ${username} logged in, session ID: ${sessionId}`);
        res.json({ success: true, sessionId });
    }
    catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ success: false, message: 'Login failed' });
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