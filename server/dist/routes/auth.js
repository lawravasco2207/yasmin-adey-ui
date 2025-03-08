"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const authController_1 = require("../controllers/authController");
const router = express_1.default.Router();
// ✅ POST request for login
router.post('/login', authController_1.login);
// ✅ GET request to check session (important for auth checks)
router.get('/session', authController_1.checkSession);
// ✅ Add a default route for debugging
router.get('/', (req, res) => {
    res.json({ message: 'Auth API is working!' });
});
exports.default = router;
//# sourceMappingURL=auth.js.map