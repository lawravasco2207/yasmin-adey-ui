"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const dotenv_1 = __importDefault(require("dotenv")); // Ensure dotenv is used
const auth_1 = __importDefault(require("./routes/auth"));
const chat_1 = __importDefault(require("./routes/chat"));
const content_1 = __importDefault(require("./routes/content"));
const dashboard_1 = __importDefault(require("./routes/dashboard"));
const authController_1 = require("./controllers/authController");
const links_1 = __importDefault(require("./routes/links"));
// Load environment variables
dotenv_1.default.config();
const app = (0, express_1.default)();
const PORT = process.env.PORT || 5000; // Default to 5000 if PORT is not defined
// Configure CORS to allow frontend access
app.use((0, cors_1.default)({ origin: process.env.FRONTEND_URL || 'http://localhost:3000' }));
// Middleware
app.use(express_1.default.json());
app.use('/uploads', express_1.default.static('src/uploads'));
// Routes
app.use('/api/links', links_1.default);
app.use('/api/auth', auth_1.default);
app.use('/api/chat', chat_1.default);
app.use('/api/content', authController_1.checkSession, content_1.default);
app.use('/api/dashboard', authController_1.checkSession, dashboard_1.default);
// Start server
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
//# sourceMappingURL=server.js.map