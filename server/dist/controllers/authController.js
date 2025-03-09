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
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const SECRET_KEY = process.env.SECRET_KEY || 'your_secret_key';
const login = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { input } = req.body;
    console.log('Login attempt:', { input });
    if (!input) {
        console.log('No input provided');
        res.status(400).json({ success: false, message: 'Input required' });
        return;
    }
    if (input.toLowerCase() !== 'yas') {
        console.log('Invalid input—not "yas"');
        res.status(401).json({ success: false, message: 'Nope, try again!' });
        return;
    }
    console.log('Input matches "yas"—generating token');
    const token = jsonwebtoken_1.default.sign({ user: 'yasmin' }, SECRET_KEY, { expiresIn: '1h' });
    res.json({ success: true, token });
});
exports.login = login;
const checkSession = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const authHeader = req.headers['authorization'];
    console.log('Checking session, auth header:', authHeader || 'None provided');
    if (!authHeader) {
        console.log('No authorization header');
        res.status(401).json({ success: false, message: 'Please log in' });
        return;
    }
    const token = authHeader.split(' ')[1];
    if (!token) {
        console.log('No token found');
        res.status(401).json({ success: false, message: 'Please log in' });
        return;
    }
    try {
        console.log('Verifying token');
        const decoded = jsonwebtoken_1.default.verify(token, SECRET_KEY);
        console.log('Token verified, user:', decoded.user);
        req.user = { id: decoded.user };
        next();
    }
    catch (error) {
        console.error('Session check error:', {
            message: error.message,
            stack: error.stack,
        });
        res.status(401).json({ success: false, message: 'Session invalid or expired' });
    }
});
exports.checkSession = checkSession;
//# sourceMappingURL=authController.js.map