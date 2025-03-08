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
exports.addTodo = exports.getTodos = void 0;
const db_1 = __importDefault(require("../db"));
const getTodos = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const userId = req.user.id; // From authenticateToken
    try {
        const result = yield db_1.default.query('SELECT * FROM todos WHERE user_id = $1 ORDER BY due_date', [userId]);
        res.json({ success: true, data: result.rows });
    }
    catch (error) {
        console.error('Get todos error:', error);
        res.status(500).json({ success: false, message: 'Failed to fetch todos' });
    }
});
exports.getTodos = getTodos;
const addTodo = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const userId = req.user.id;
    const { title, priority, due_date } = req.body;
    if (!title || !priority || !due_date) {
        res.status(400).json({ success: false, message: 'Title, priority, and due date are required' });
        return;
    }
    try {
        const result = yield db_1.default.query('INSERT INTO todos (title, priority, due_date, user_id) VALUES ($1, $2, $3, $4) RETURNING *', [title, priority, due_date, userId]);
        console.log('Todo added:', result.rows[0]);
        res.json({ success: true, data: result.rows[0] });
    }
    catch (error) {
        console.error('Add todo error:', error);
        res.status(500).json({ success: false, message: 'Failed to add todo' });
    }
});
exports.addTodo = addTodo;
//# sourceMappingURL=dashboardController.js.map