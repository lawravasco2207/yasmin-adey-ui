"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
// src/server.ts
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const dotenv_1 = __importDefault(require("dotenv"));
const auth_1 = __importDefault(require("./routes/auth"));
const chat_1 = __importDefault(require("./routes/chat"));
const content_1 = __importDefault(require("./routes/content"));
const dashboard_1 = __importDefault(require("./routes/dashboard"));
const links_1 = __importDefault(require("./routes/links"));
const authController_1 = require("./controllers/authController");
const path_1 = __importDefault(require("path"));
// Load environment variables
dotenv_1.default.config();
const app = (0, express_1.default)();
const PORT = process.env.PORT || 10000;
// Configure CORS
app.use((0, cors_1.default)({ origin: process.env.FRONTEND_URL || 'http://localhost:3000' }));
// Middleware
app.use(express_1.default.json());
// Routes
app.use('/api/auth', auth_1.default);
app.use('/api/chat', chat_1.default);
app.use('/api/content', authController_1.checkSession, content_1.default);
app.use('/api/dashboard', authController_1.checkSession, dashboard_1.default);
app.use('/api/links', links_1.default);
app.use('/uploads', express_1.default.static(path_1.default.join(__dirname, 'uploads')));
// Start server
app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});
//# sourceMappingURL=server.js.map