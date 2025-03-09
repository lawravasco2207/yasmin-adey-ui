"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
// src/routes/dashboard.ts
const express_1 = __importDefault(require("express"));
const dashboardController_1 = __importDefault(require("../controllers/dashboardController")); // Import default
const router = express_1.default.Router();
router.get('/todos', dashboardController_1.default.getTodos); // Array with checkSession
router.post('/todos', dashboardController_1.default.addTodo); // Array with checkSession
exports.default = router;
//# sourceMappingURL=dashboard.js.map